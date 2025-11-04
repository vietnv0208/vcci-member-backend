import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateMemberDto } from './create-member.dto';

export class UpsertMemberDto extends CreateMemberDto {
  @ApiPropertyOptional({ description: 'Mã hội viên (dùng làm khóa cập nhật nếu có)' })
  @IsOptional()
  @IsString()
  code?: string;
}


