import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateBusinessCategoryDto {
  @ApiPropertyOptional({
    description: 'Mã danh mục (ví dụ: "A", "11", "1200")',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({
    description: 'Tên danh mục ngành nghề',
    example: 'Nông nghiệp, lâm nghiệp và thủy sản',
  })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString()
  @MaxLength(500)
  name: string;

  @ApiProperty({
    description: 'Cấp độ của danh mục (1, 2, 3...)',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Cấp độ không được để trống' })
  @IsInt()
  @Min(1)
  level: number;

  @ApiPropertyOptional({
    description: 'ID của danh mục cha (nếu có)',
    example: 'clxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}

