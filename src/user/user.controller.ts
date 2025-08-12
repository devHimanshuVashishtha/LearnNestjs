import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateUserDto: Partial<CreateUserDto>
  ) {
    return this.userService.update(id, UpdateUserDto)
  }
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number) {
    this.userService.delete(id);
    return { message: `user :${id} is deleted` }
  }
}
