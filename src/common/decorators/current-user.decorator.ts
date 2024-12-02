import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TUserPayload } from '../../types/user-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): TUserPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
