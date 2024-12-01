import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../../types/user-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
