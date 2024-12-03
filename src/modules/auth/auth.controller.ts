import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TUserPayload } from 'src/types/user-payload.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto, description: 'The user registration data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'The user was successfully registered. A refresh token is stored in an HTTP-only cookie.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'The request data is invalid or an error occurred during registration.',
  })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    return await this.authService.register(registerDto, res);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto, description: 'The user login data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'The user was successfully logged in. An access token is generated.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided credentials are invalid.',
  })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return await this.authService.login(loginDto, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Log out a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'The user was successfully logged out. The refresh token is removed from the cookie.',
  })
  async logout(@CurrentUser() user: TUserPayload, @Res() res: Response) {
    return await this.authService.logout(user, res);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The access token was successfully refreshed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The refresh token is invalid or expired.',
  })
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    return await this.authService.refreshAccessToken(req, res);
  }
}
