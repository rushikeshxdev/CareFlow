import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Sarah Jenkins', description: 'Full name of the user' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({ example: 'sarah.jenkins@example.com', description: 'Unique user email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 8 chars, at least 1 letter & 1 number)' })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'Password must be at least 8 characters long and contain at least 1 letter and 1 number',
  })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'sarah.jenkins@example.com', description: 'Registered user email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Account password' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Refresh token (optional if sent via cookie)', required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
