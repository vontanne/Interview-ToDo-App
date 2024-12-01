import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONFIG } from '../../configs/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(authDto: AuthDto, res: Response) {
    const { email, password } = authDto;
    const { SALT } = AUTH_CONFIG;
    const hashedPassword = await bcrypt.hash(password, SALT);

    const newUser = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const { id } = newUser;

    const accessToken = this.generateAccessToken(id, email);
    const refreshToken = this.generateRefreshToken(id, email);

    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, newUser });
  }

  async login(authDto: AuthDto, res: Response) {
    const { email, password } = authDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const { id } = user;
    const accessToken = this.generateAccessToken(id, email);
    const refreshToken = this.generateRefreshToken(id, email);

    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, user });
  }

  private generateAccessToken(id: number, email: string): string {
    const { ACCESS_TOKEN_SECRET } = AUTH_CONFIG;
    const accessToken = this.jwtService.sign(
      { id, email },
      { secret: ACCESS_TOKEN_SECRET, expiresIn: '15m' },
    );
    return accessToken;
  }

  private generateRefreshToken(id: number, email: string): string {
    const { REFRESH_TOKEN_SECRET } = AUTH_CONFIG;
    const refreshToken = this.jwtService.sign(
      { id, email },
      { secret: REFRESH_TOKEN_SECRET, expiresIn: '1d' },
    );
    return refreshToken;
  }
}
