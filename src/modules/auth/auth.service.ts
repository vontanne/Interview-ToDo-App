import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONFIG } from '../../configs/jwt.config';
import { UserService } from '../user/user.service';
import { TUserPayload } from 'src/types/user-payload.type';
import { sanitizeUser } from 'src/common/helpers/sanitize-user';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async register(registerDto: RegisterDto, res: Response): Promise<Response> {
    try {
      const { fullName, email, password } = registerDto;
      const { SALT } = AUTH_CONFIG;

      const hashedPassword = await bcrypt.hash(password, SALT);
      const newUser = await this.userService.create(
        fullName,
        email,
        hashedPassword,
      );

      const { id } = newUser;
      const accessToken = this.generateAccessToken(id, email);
      const refreshToken = this.generateRefreshToken(id, email);

      await this.userService.updateUserRefreshToken(id, refreshToken);

      this.setCookie(res, refreshToken);

      return res.json({ accessToken, newUser });
    } catch (ex) {
      if (ex instanceof ConflictException) {
        return res.status(HttpStatus.CONFLICT).json({ message: ex.message });
      }

      if (ex instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: ex.message });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:
          'An error occurred during registration. Please try again later.',
      });
    }
  }

  async login(loginDto: LoginDto, res: Response): Promise<Response> {
    try {
      const { email, password } = loginDto;

      const user = await this.userService.getByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid credentials' });
      }

      const { id } = user;
      const accessToken = this.generateAccessToken(id, email);
      const refreshToken = this.generateRefreshToken(id, email);

      await this.userService.updateUserRefreshToken(id, refreshToken);

      this.setCookie(res, refreshToken);

      const sanitizedUser = sanitizeUser(user);

      return res.json({ accessToken, user: sanitizedUser });
    } catch (ex) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred during login. Please try again later.',
      });
    }
  }

  async logout(user: TUserPayload, res: Response): Promise<Response> {
    try {
      await this.userService.updateUserRefreshToken(user.id, null);
      res.clearCookie('jwt');
      return res.status(HttpStatus.OK).json({ message: 'Sign-out successful' });
    } catch (ex) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred during logout. Please try again later.',
      });
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies['jwt'];
    const { REFRESH_TOKEN_SECRET } = AUTH_CONFIG;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      });

      const user = await this.userService.getByEmail(decoded.email);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.generateAccessToken(user.id, user.email);
      const newRefreshToken = this.generateRefreshToken(user.id, user.email);

      await this.userService.updateUserRefreshToken(user.id, newRefreshToken);

      this.setCookie(res, newRefreshToken);

      return res.json({ accessToken: newAccessToken });
    } catch (ex) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to refresh access token.',
      });
    }
  }

  private generateAccessToken(id: number, email: string): string {
    const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRATION } = AUTH_CONFIG;
    return this.jwtService.sign(
      { id, email },
      {
        secret: ACCESS_TOKEN_SECRET,
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      },
    );
  }

  private generateRefreshToken(id: number, email: string): string {
    const { REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRATION } = AUTH_CONFIG;
    return this.jwtService.sign(
      { id, email },
      {
        secret: REFRESH_TOKEN_SECRET,
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      },
    );
  }

  private setCookie(res: Response, token: string): void {
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
}
