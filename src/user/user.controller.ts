import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.userService.login(dto)
    return {
      message: 'Login Successfully',
      user: {
        email: user.email,
        name: user.name,
        age: user.age,
        country: user.country
      }
    }
  }
  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto){
    return this.userService.create(CreateUserDto)
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() UpdateUserDto: Partial<CreateUserDto>
  ) {
    return this.userService.update(id, UpdateUserDto)
  }
  @Delete(':id')
  remove(
    @Param('id') id: string) {
    this.userService.delete(id);
    return { message: `user :${id} is deleted` }
  }
}
