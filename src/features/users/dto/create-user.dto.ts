import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Email address for login', uniqueItems: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the user', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ 
    description: 'Role of the user', 
    enum: UserRole, 
    default: UserRole.MANAGEMENT 
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;


  @ApiProperty({ description: 'Department of the user', required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ description: 'Whether the user is active', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
