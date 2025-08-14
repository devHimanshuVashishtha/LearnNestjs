import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { promises } from 'dns';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) { }
  async login(dto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException("invalid email");
    }
    const checkPassword = await bcrypt.compare(dto.password, user.password)
    if (!checkPassword) {
      throw new UnauthorizedException('invalid password')
    }
    const payloads = { sub: user._id, email: user.email }
    const token = this.jwtService.sign(payloads)
    return { access_token: token, user }
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email })
      if (existingUser) {
        throw new ConflictException('Email is already exists')
      }
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
      const CreateUser = new this.userModel({ ...createUserDto, password: hashedPassword })

      return CreateUser.save();
    }
    catch (err) {
      throw err;
    }
  }
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  async update(id: string, UpdateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, UpdateUserDto, {
      new: true,
    })
    if (!user) {
      throw new NotFoundException(`User not Found fot Id:${id}`)
    }
    return user

  }
  async delete(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id)
    if (!user) {
      throw new NotFoundException(`Wrong Id:${id}`)
    }
  }
  async generateResetToken(email: string): Promise<string | null> {
    const user = await this.userModel.findOne({ email })
    if (!user) {
      throw new NotFoundException('Wrong email provided')
    }
    const payloads = { sub: user._id, email: user.email, pupose: 'reset' }
    const token = this.jwtService.sign(payloads, { expiresIn: "10m" })
    return token
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean | null> {
    const verifyToken = this.jwtService.verify(token)
    if (verifyToken.pupose !== 'reset') {
      throw new BadRequestException('Wrong Token Providede')
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await this.userModel.updateOne({
      _id: verifyToken.sub
    }, {
      $set: { password: hashedPassword }
    })
    return true
  }
}
