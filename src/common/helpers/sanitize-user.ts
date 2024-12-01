import { UserDto } from '../../modules/user/dto/user.dto';
import { User } from '@prisma/client';

export const sanitizeUser = (user: User): UserDto => {
  const { password, refreshToken, ...sanitizedUser } = user;
  return sanitizedUser;
};
