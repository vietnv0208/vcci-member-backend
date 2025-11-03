import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBranchCategoryDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo tên' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động' })
  @IsBooleanString()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: any;

  @ApiPropertyOptional({ description: 'Trang', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Số bản ghi mỗi trang', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99999)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường', enum: ['name', 'createdAt', 'updatedAt'] })
  @IsString()
  @IsOptional()
  sortBy?: 'name' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', enum: ['asc', 'desc'], default: 'asc' })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}


