import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TodosModule } from './modules/todo/todos.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    TodosModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
  ],
  providers: [],
})
export class AppModule {}
