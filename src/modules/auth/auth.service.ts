import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONFIG } from '../../configs/jwt.config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async register(authDto: AuthDto, res: Response) {
    const { email, password } = authDto;
    const { SALT } = AUTH_CONFIG;
    const hashedPassword = await bcrypt.hash(password, SALT);

    const newUser = await this.userService.create(email, hashedPassword);
    const { id } = newUser;

    const accessToken = this.generateAccessToken(id, email);
    const refreshToken = this.generateRefreshToken(id, email);

    await this.userService.updateUserRefreshToken(id, refreshToken);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, newUser });
  }

  async login(authDto: AuthDto, res: Response) {
    const { email, password } = authDto;
    const user = await this.userService.getByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const { id } = user;
    const accessToken = this.generateAccessToken(id, email);
    const refreshToken = this.generateRefreshToken(id, email);

    await this.userService.updateUserRefreshToken(id, refreshToken);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, user });
  }

  private generateAccessToken(id: number, email: string): string {
    const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRATION } = AUTH_CONFIG;
    const accessToken = this.jwtService.sign(
      { id, email },
      { secret: ACCESS_TOKEN_SECRET, expiresIn: ACCESS_TOKEN_EXPIRATION },
    );
    return accessToken;
  }

  private generateRefreshToken(id: number, email: string): string {
    const { REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRATION } = AUTH_CONFIG;
    const refreshToken = this.jwtService.sign(
      { id, email },
      { secret: REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRATION },
    );
    return refreshToken;
  }
}
