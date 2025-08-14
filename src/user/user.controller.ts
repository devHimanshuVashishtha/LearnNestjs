import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const { access_token, user } = await this.userService.login(dto);
    return {
      message: 'Login Successfully',
      access_token,
      user: {
        email: user.email,
        name: user.name,
        age: user.age,
        country: user.country
      }
    }
  }
  @Post('register')
  @UseInterceptors(
    FileInterceptor('profilepic', {
      storage: memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 2,
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('You are given the wrong file format'), false)
        }
        callback(null, true)

      },
    })

  )
  async register(@Body() CreateUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File) {
    const base64image = file ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : undefined


    const userData = {
      ...CreateUserDto, profilepic: base64image
    }
    return this.userService.create(userData)
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
