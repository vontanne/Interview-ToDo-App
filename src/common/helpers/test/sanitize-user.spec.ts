import { sanitizeUser } from '../sanitize-user';
import { User } from '@prisma/client';
import { UserDto } from '../../../modules/user/dto/user.dto';

describe('sanitizeUser', () => {
  it('should remove password and refreshToken fields from the user object', () => {
    const mockUser: User = {
      id: 1,
      fullName: 'Anakin Skywalker',
      email: 'anakin@jediorder.com',
      password: 'darkside123',
      refreshToken: 'sith-refresh-token',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z'),
    };

    const expectedSanitizedUser: UserDto = {
      id: 1,
      fullName: 'Anakin Skywalker',
      email: 'anakin@jediorder.com',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z'),
    };

    const result = sanitizeUser(mockUser);

    expect(result).toEqual(expectedSanitizedUser);
  });

  it('should handle null or missing refreshToken gracefully', () => {
    const mockUser = {
      id: 2,
      fullName: 'Obi-Wan Kenobi',
      email: 'obiwan@jediorder.com',
      password: 'highground123',
      refreshToken: null,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z'),
    } as User;

    const expectedSanitizedUser: UserDto = {
      id: 2,
      fullName: 'Obi-Wan Kenobi',
      email: 'obiwan@jediorder.com',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z'),
    };

    const result = sanitizeUser(mockUser);

    expect(result).toEqual(expectedSanitizedUser);
  });
});
