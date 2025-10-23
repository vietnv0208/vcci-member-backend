import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PublicQueryBusinessCategoryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên hoặc mã',
    example: 'Nông nghiệp',
  })
  @IsOptional()
  @IsString()
  search?: string;
}


