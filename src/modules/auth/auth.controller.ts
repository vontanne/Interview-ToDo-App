import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() authDto: AuthDto, @Res() res: Response) {
    return await this.authService.register(authDto, res);
  }

  @Post('login')
  async login(@Body() authDto: AuthDto, @Res() res: Response) {
    return await this.authService.login(authDto, res);
  }
}
