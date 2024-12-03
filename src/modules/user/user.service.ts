import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizeUser } from 'src/common/helpers/sanitize-user';
import { UserDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';
import { TUser } from 'src/types/user.type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getByEmail(email: string): Promise<TUser> {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (ex) {
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async create(
    fullName: string,
    email: string,
    hashedPassword: string,
  ): Promise<UserDto> {
    try {
      const newUser = await this.prisma.user.create({
        data: { fullName, email, password: hashedPassword },
      });
      return sanitizeUser(newUser);
    } catch (ex) {
      if (
        ex instanceof Prisma.PrismaClientKnownRequestError &&
        ex.code === 'P2002'
      ) {
        throw new ConflictException('Email address already registered');
      }

      if (ex instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(`Validation error`);
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async updateUserRefreshToken(
    id: number,
    refreshToken: string,
  ): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { refreshToken },
      });
    } catch (ex) {
      throw new InternalServerErrorException(
        'Failed to update user refresh token',
      );
    }
  }
}
