import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus, Request as NestRequest } from '@nestjs/common';
import { Request } from 'express'; // This is the Express Request type
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto.username, registerUserDto.password);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@NestRequest() req: Request) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@NestRequest() req: Request) {
    return req.user;
  }
}
