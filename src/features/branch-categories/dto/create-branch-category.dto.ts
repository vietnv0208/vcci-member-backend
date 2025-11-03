import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBranchCategoryDto {
  @ApiProperty({ description: 'Tên chi nhánh' })
  @IsString()
  @IsNotEmpty({ message: 'Tên chi nhánh là bắt buộc' })
  @MaxLength(255, { message: 'Tên chi nhánh tối đa 255 ký tự' })
  name: string;

  @ApiProperty({ description: 'Địa chỉ chi nhánh', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


