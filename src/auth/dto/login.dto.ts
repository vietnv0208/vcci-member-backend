import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email for login',
    example: 'admin@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for login',
    example: '123!@#',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
