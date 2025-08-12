import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }
  async login(dto: LoginUserDto): Promise<User> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException("invalid email or password");
    }
    return user
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
    } catch (err) {
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
}
