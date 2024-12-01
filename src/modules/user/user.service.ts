import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizeUser } from 'src/common/helpers/sanitize-user';
import { UserDto } from './dto/user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async create(email: string, hashedPassword: string): Promise<UserDto> {
    const newUser = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
    return sanitizeUser(newUser);
  }

  async updateUserRefreshToken(
    id: number,
    refreshToken: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }
}
