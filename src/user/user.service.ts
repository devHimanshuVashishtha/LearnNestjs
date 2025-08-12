import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
type User = CreateUserDto & { id: number };

@Injectable()
export class UserService {
  private users: User[] = [];
  create(createUserDto: CreateUserDto) {
    const user = { id: Date.now(), ...createUserDto }
    this.users.push(user)
    return user
  }

  findAll(): User[] {
    return this.users;
  }
  update(id: number, UpdateUserDto: Partial<CreateUserDto>): User {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) {
      throw new NotFoundException(`User id not found id:${id}`)
    }
    this.users[index] = { ...this.users[index], ...UpdateUserDto }
    return this.users[index]
  }
  delete(id: number): void {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) {
      throw new NotFoundException(`User not found for id:${id} or provide me correct id`)
    }
    this.users.splice(index, 1)
  }
}
