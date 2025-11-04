import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateMemberDto } from './create-member.dto';

export class UpsertMemberDto extends CreateMemberDto {
  @ApiPropertyOptional({ description: 'Mã hội viên (dùng làm khóa cập nhật nếu có)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description:
      'Chuỗi năm hội phí từ file import. Có thể là nối liền hoặc có ký tự phân tách. Ví dụ: "2001200320042006|" hoặc "2001,2003,2004,2006"',
  })
  @IsOptional()
  @IsString()
  paymentYears?: string; // text từ file excel

}


