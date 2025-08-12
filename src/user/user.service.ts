import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const CreateUser = new this.userModel(createUserDto)
    return CreateUser.save();
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
