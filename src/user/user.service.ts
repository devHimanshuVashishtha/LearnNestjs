import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
type User = CreateUserDto & { id: number };

@Injectable()
export class UserService {
  private users :User []= [];
  create(createUserDto: CreateUserDto) {
    const user = { id: Date.now(), ...createUserDto }
    this.users.push(user)
    return user
  }

  findAll() {
    return this.users;
  }
}
