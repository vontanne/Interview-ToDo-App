import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { sanitizeUser } from 'src/common/helpers/sanitize-user';

jest.mock('src/common/helpers/sanitize-user');

describe('UserService (Star Wars Edition)', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getByEmail', () => {
    it('should return a user when found (Obi-Wan Kenobi)', async () => {
      const mockUser = {
        id: 1,
        email: 'obiwan@jedi.com',
        fullName: 'Obi-Wan Kenobi',
        password: 'force123',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockUser);

      const result = await userService.getByEmail('obiwan@jedi.com');
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'obiwan@jedi.com' },
      });
    });

    it('should throw an InternalServerErrorException when the dark side attacks the database', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValueOnce(new Error('Sith interference'));

      await expect(
        userService.getByEmail('anakin@darkside.com'),
      ).rejects.toThrow(
        new InternalServerErrorException('Failed to find user by email'),
      );
    });
  });

  describe('create', () => {
    it('should create a new Jedi and return sanitized data (Luke Skywalker)', async () => {
      const mockUser = {
        id: 2,
        email: 'luke@jedi.com',
        fullName: 'Luke Skywalker',
        password: 'theforce',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce(mockUser);

      (sanitizeUser as jest.Mock).mockReturnValue({
        id: 2,
        email: 'luke@jedi.com',
        fullName: 'Luke Skywalker',
      });

      const result = await userService.create(
        'Luke Skywalker',
        'luke@jedi.com',
        'theforce',
      );
      expect(result).toEqual({
        id: 2,
        email: 'luke@jedi.com',
        fullName: 'Luke Skywalker',
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'Luke Skywalker',
          email: 'luke@jedi.com',
          password: 'theforce',
        },
      });
    });

    it('should throw a ConflictException if Darth Vader already owns the email', async () => {
      const mockError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );
      jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce(mockError);

      await expect(
        userService.create('Darth Vader', 'vader@empire.com', 'darkside'),
      ).rejects.toThrow(
        new ConflictException('Email address already registered'),
      );
    });

    it('should throw a BadRequestException when a protocol droid malfunctions (validation error)', async () => {
      const mockError = new Prisma.PrismaClientValidationError(
        'Validation error',
        {
          clientVersion: '5.0.0',
        },
      );
      jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce(mockError);

      await expect(
        userService.create('C-3PO', '', 'beep-boop'),
      ).rejects.toThrow(new BadRequestException('Validation error'));
    });

    it('should throw an InternalServerErrorException when the Death Star disrupts the system', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(new Error('Unexpected system failure'));

      await expect(
        userService.create('Leia Organa', 'leia@rebellion.com', 'hope'),
      ).rejects.toThrow(
        new InternalServerErrorException('Failed to create user'),
      );
    });
  });

  describe('updateUserRefreshToken', () => {
    it('should update the refresh token successfully for Chewbacca', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce(undefined);

      await expect(
        userService.updateUserRefreshToken(3, 'refreshToken'),
      ).resolves.not.toThrow();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { refreshToken: 'refreshToken' },
      });
    });

    it('should throw an InternalServerErrorException when Ewoks mess up the database', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(new Error('Ewok interference'));

      await expect(
        userService.updateUserRefreshToken(3, 'refreshToken'),
      ).rejects.toThrow(
        new InternalServerErrorException('Failed to update user refresh token'),
      );
    });
  });
});
