import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { TUserPayload } from 'src/types/user-payload.type';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
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

      jest.spyOn(authService, 'register').mockResolvedValueOnce(mockResponse);

      await authController.register(registerDto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(
        registerDto,
        mockResponse,
      );
    });
  });

  describe('login', () => {
    it('should return 401 for invalid credentials', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const loginDto: LoginDto = {
        email: 'luke@rebellion.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'login').mockImplementation(async (_, res) => {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid credentials' });
        return res;
      });

      await authController.login(loginDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
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

      const user: TUserPayload = { id: 1, email: 'yoda@dagobah.com' };

      jest.spyOn(authService, 'logout').mockResolvedValueOnce(mockResponse);

      await authController.logout(user, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(user, mockResponse);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh the access token for Chewbacca', async () => {
      const mockRequest = {
        cookies: { jwt: 'mockRefreshToken' },
      } as unknown as Request;

      const mockResponse = {
        json: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(authService, 'refreshAccessToken')
        .mockResolvedValueOnce(mockResponse);

      await authController.refreshAccessToken(mockRequest, mockResponse);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
      );
    });
  });
});
