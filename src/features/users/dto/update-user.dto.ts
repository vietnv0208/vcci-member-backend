import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({ description: 'Full name of the user', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: 'Username for login', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'New password (will be hashed automatically)', required: false, minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsOptional()
  password?: string;

  @ApiProperty({ 
    description: 'Role of the user', 
    enum: UserRole, 
    required: false 
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'Email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Department of the user', required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ description: 'Whether the user is active', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'Whether the user should be active or inactive' })
  @IsBoolean()
  active: boolean;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'New password for the user', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
