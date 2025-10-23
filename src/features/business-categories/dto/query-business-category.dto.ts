import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class QueryBusinessCategoryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên hoặc mã',
    example: 'Nông nghiệp',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo cấp độ',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo parent ID (null để lấy root categories)',
    example: 'clxxxxxxxxxxxxx',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Lấy kèm children (hierarchical)',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description: 'Số trang',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mỗi trang',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

