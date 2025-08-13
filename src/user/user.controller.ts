import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LoginUserDto } from './dto/login-user.dto';
import { profile } from 'console';


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
  @UseInterceptors(
    FileInterceptor('profilepic', {
      storage: diskStorage({
        destination: './uploads/profilepic',
        filename: (req, file, cb) => {
          const uniSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          cb(null, file.filename + '-' + uniSuffix + extname(file.originalname))
        }
      }),
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
    const userData = {
      ...CreateUserDto, profilepic: file?.filename || null
    }
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
