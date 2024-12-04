import { JwtAuthGuard } from '../jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONFIG } from '../../../configs/jwt.config';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtService: JwtService;

  beforeEach(() => {
    mockJwtService = {
      verify: jest.fn(),
    } as unknown as JwtService;

    guard = new JwtAuthGuard(mockJwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for a valid token', () => {
      const mockContext = createMockExecutionContext('Bearer valid.token');
      jest.spyOn(mockJwtService, 'verify').mockReturnValueOnce({
        id: 1,
        email: 'luke@rebellion.com',
      });

      expect(guard.canActivate(mockContext)).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid.token', {
        secret: AUTH_CONFIG.ACCESS_TOKEN_SECRET,
      });
    });

    it('should throw UnauthorizedException for an invalid token', () => {
      const mockContext = createMockExecutionContext('Bearer invalid.token');
      jest.spyOn(mockJwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => guard.canActivate(mockContext)).toThrow(
        new UnauthorizedException('Invalid token'),
      );
    });

    it('should throw UnauthorizedException if no token is provided', () => {
      const mockContext = createMockExecutionContext('');
      expect(() => guard.canActivate(mockContext)).toThrow(
        new UnauthorizedException('No authentication token provided'),
      );
    });
  });

  function createMockExecutionContext(authHeader: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  }
});
