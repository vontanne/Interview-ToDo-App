import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [JwtModule.register({ global: true }), UserModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}