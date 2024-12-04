import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { sanitizeUser } from 'src/common/helpers/sanitize-user';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

jest.mock('src/common/helpers/sanitize-user');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  const mockUser = {
    id: 1,
    fullName: 'Luke Skywalker',
    email: 'luke@rebellion.com',
    password: 'hashedPassword',
    refreshToken: 'mockRefreshToken',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockUser = (overrides: Partial<typeof mockUser> = {}) => ({
    ...mockUser,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getByEmail: jest.fn(),
            create: jest.fn(),
            updateUserRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user (Darth Vader)', async () => {
      const mockResponse = {
        json: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const registerDto: RegisterDto = {
        fullName: 'Darth Vader',
        email: 'vader@empire.com',
        password: 'darkside123',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userService, 'create').mockResolvedValue(
        createMockUser({
          fullName: 'Darth Vader',
          email: 'vader@empire.com',
        }),
      );
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');

      await authService.register(registerDto, mockResponse);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        'darkside123',
        expect.any(Number),
      );
      expect(userService.create).toHaveBeenCalledWith(
        'Darth Vader',
        'vader@empire.com',
        'hashedPassword',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'jwt',
        'mockAccessToken',
        {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: 'mockAccessToken',
        newUser: expect.objectContaining({
          fullName: 'Darth Vader',
          email: 'vader@empire.com',
        }),
      });
    });
  });

  describe('login', () => {
    it('should log in a user (Luke Skywalker)', async () => {
      const mockResponse = {
        json: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const loginDto: LoginDto = {
        email: 'luke@rebellion.com',
        password: 'jedi123',
      };

      jest.spyOn(userService, 'getByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');
      (sanitizeUser as jest.Mock).mockReturnValue({
        id: 1,
        fullName: 'Luke Skywalker',
        email: 'luke@rebellion.com',
      });

      await authService.login(loginDto, mockResponse);

      expect(userService.getByEmail).toHaveBeenCalledWith('luke@rebellion.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('jedi123', 'hashedPassword');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'jwt',
        'mockAccessToken',
        {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: 'mockAccessToken',
        user: {
          id: 1,
          fullName: 'Luke Skywalker',
          email: 'luke@rebellion.com',
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const loginDto: LoginDto = {
        email: 'luke@rebellion.com',
        password: 'wrongpassword',
      };

      jest.spyOn(userService, 'getByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await authService.login(loginDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });
  });

  describe('logout', () => {
    it('should log out a user (Yoda)', async () => {
      const mockResponse = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const user = { id: 1, email: 'yoda@dagobah.com' };

      await authService.logout(user, mockResponse);

      expect(userService.updateUserRefreshToken).toHaveBeenCalledWith(1, null);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sign-out successful',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh the access token for Chewbacca', async () => {
      const mockRequest = { cookies: { jwt: 'mockRefreshToken' } } as any;
      const mockResponse = {
        json: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValue({ id: 4, email: 'chewbacca@falcon.com' });
      jest.spyOn(userService, 'getByEmail').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('newAccessToken');

      await authService.refreshAccessToken(mockRequest, mockResponse);

      expect(jwtService.verify).toHaveBeenCalledWith('mockRefreshToken', {
        secret: expect.any(String),
      });
      expect(userService.updateUserRefreshToken).toHaveBeenCalledWith(
        1,
        'newAccessToken',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'jwt',
        'newAccessToken',
        {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: 'newAccessToken',
      });
    });
  });
});
