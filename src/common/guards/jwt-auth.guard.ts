import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONFIG } from 'src/configs/jwt.config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const { ACCESS_TOKEN_SECRET } = AUTH_CONFIG;
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: ACCESS_TOKEN_SECRET,
      });
      request.user = { id: decoded.id, email: decoded.email };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
