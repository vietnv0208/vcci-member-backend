import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { CategoryType } from './category-types.enum';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Công ty TNHH',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category code',
    example: 'TNHH',
    required: false,
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Parent category ID for hierarchical categories',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description: 'Category type',
    enum: CategoryType,
    example: CategoryType.ORGANIZATION_TYPE,
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({
    description: 'Category description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Whether category is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Display order index',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
} 