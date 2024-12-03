import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    required: true,
    description: 'Full name of the user',
    example: 'Quentin Tarantino',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    required: true,
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true,
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
