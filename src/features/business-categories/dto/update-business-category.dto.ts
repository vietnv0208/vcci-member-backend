import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateBusinessCategoryDto {
  @ApiPropertyOptional({
    description: 'Mã danh mục',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({
    description: 'Tên danh mục ngành nghề',
    example: 'Nông nghiệp, lâm nghiệp và thủy sản',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  name?: string;

  @ApiPropertyOptional({
    description: 'Cấp độ của danh mục',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    description: 'ID của danh mục cha (null để xóa parent)',
    example: 'clxxxxxxxxxxxxx',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}

