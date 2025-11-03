import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationType, MemberType, MemberStatus } from '@prisma/client';

export class QueryMemberDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên, email, mã số thuế' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ApplicationType, description: 'Lọc theo loại đơn đăng ký' })
  @IsOptional()
  @IsEnum(ApplicationType)
  applicationType?: ApplicationType;

  @ApiPropertyOptional({ enum: MemberType, description: 'Lọc theo loại hội viên' })
  @IsOptional()
  @IsEnum(MemberType)
  memberType?: MemberType;

  @ApiPropertyOptional({ enum: MemberStatus, description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ 
    description: 'Lọc theo ngành nghề kinh doanh (sẽ tìm cả category con)',
    example: 'clxxxxxxxxxxxxxx'
  })
  @IsOptional()
  @IsString()
  businessCategoryId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo chi nhánh VCCI' })
  @IsOptional()
  @IsString()
  branchCategoryId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ngày đăng ký từ' })
  @IsOptional()
  @IsDateString()
  submittedDateFrom?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ngày đăng ký đến' })
  @IsOptional()
  @IsDateString()
  submittedDateTo?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ngày duyệt từ' })
  @IsOptional()
  @IsDateString()
  approvedDateFrom?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ngày duyệt đến' })
  @IsOptional()
  @IsDateString()
  approvedDateTo?: string;

  @ApiPropertyOptional({ description: 'Số trang', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99999)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
