import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Req, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LoginUserDto } from './dto/login-user.dto';
import { NotFoundError } from 'rxjs';

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

  @Post('forget-password')
  async forgetpassword(
    @Body('email') email: string) {
    const resetToken = await this.userService.generateResetToken(email)
    if (!resetToken) {
      throw new NotFoundException('token not generated')
    }
    return {
      message: 'this token is valid for 10 min',
      resetToken
    }
  }

  @Post('reset-password')
  async resetPssword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    const sucess = await this.userService.resetPassword(token, newPassword)
    if (!sucess) {
      throw new BadRequestException('Faild to update password or token expire')
    }
    return { message: 'Your Password updated successfully' }
  }
}
