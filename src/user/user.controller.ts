import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Req, NotFoundException, UnauthorizedException, UseGuards, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LoginUserDto } from './dto/login-user.dto';
import { MailService } from 'src/mail/mail.service';
import { SmsService } from 'src/sms/sms.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) { }
  @Post('login')
  async login(@Res() res: Response, @Body() dto: LoginUserDto) {
    const { access_token, user } = await this.userService.login(dto);
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000,
    });
    res.send({
      message: 'Login successful',
      access_token,
      user: {
        email: user.email,
        name: user.name,
        age: user.age,
        country: user.country,
      },
    });
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
    const base64image = file ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : undefined;
    const userData = {
      ...CreateUserDto, profilepic: base64image
    }
    return this.userService.create(userData)
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string) {
    this.userService.delete(id);
    return { message: `user :${id} is deleted` }
  }

  @Post('forget-password')
  async forgetpassword(
    @Body() body: { email: string; phone: string }) {
    const resetToken = await this.userService.generateResetToken(body.email)
    if (!resetToken) {
      throw new NotFoundException('token not generated')
    }
    await this.mailService.sendMail(
      body.email,
      'Password Reset',
      `Your password reset token is: ${resetToken}`,
    )
    await this.smsService.smsSend(
      body.phone, `Your password reset token is: ${resetToken}`);
    return {
      message: 'this token is valid for 10 min',
      resetToken
    }
  }

  @Post('reset-password')
  async resetPassword(@Req() req, @Body('newPassword') newPassword: string) {
    const userPayload = req['resetuser'];
    const success = await this.userService.resetPassword(userPayload.sub, newPassword);
    if (!success) {
      throw new BadRequestException('Failed to update password or token expired');
    }
    return { message: 'Your Password updated successfully' }
  }
}
