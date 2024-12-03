import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 12,
  })
  id: number;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'Quentin Tarantino',
  })
  fullName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'example@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The date and time when the user was created',
    example: '2024-10-15T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the user was last updated',
    example: '2024-10-15T12:34:56.789Z',
  })
  updatedAt: Date;
}
