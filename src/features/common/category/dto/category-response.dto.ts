import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from './category-types.enum';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'clr123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Công ty TNHH',
  })
  name: string;

  @ApiProperty({
    description: 'Category code',
    example: 'TNHH',
    nullable: true,
  })
  code: string | null;

  @ApiProperty({
    description: 'Parent category ID',
    nullable: true,
  })
  parentId: string | null;

  @ApiProperty({
    description: 'Category type',
    enum: CategoryType,
    example: CategoryType.ORGANIZATION_TYPE,
  })
  type: CategoryType;

  @ApiProperty({
    description: 'Category description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Whether category is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Display order index',
    nullable: true,
  })
  orderIndex: number | null;

  @ApiProperty({
    description: 'Whether category is deleted',
    example: false,
  })
  deleted: boolean;

  @ApiProperty({
    description: 'User ID who created the category',
    nullable: true,
  })
  createdBy: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CategorySummaryDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'clr123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Category code',
    example: 'TNHH',
    nullable: true,
  })
  code: string | null;

  @ApiProperty({
    description: 'Category name',
    example: 'Công ty TNHH',
  })
  name: string;
} 