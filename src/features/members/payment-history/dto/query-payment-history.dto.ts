import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class QueryPaymentHistoryDto {
  @ApiProperty({
    description: 'ID của hội viên',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiProperty({
    description: 'Năm hội phí',
    example: 2024,
    minimum: 2000,
    maximum: 2100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  paymentYear?: number;

  @ApiProperty({
    description: 'Tên giao dịch thanh toán',
    example: 'Hội phí năm 2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentName?: string;

  @ApiProperty({
    description: 'Mã giao dịch thanh toán',
    example: 'VCCI-PAY-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentCode?: string;

  @ApiProperty({
    description: 'Hình thức thanh toán',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiProperty({
    description: 'Trạng thái thanh toán',
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'Tìm kiếm theo từ khóa (tên giao dịch, mã giao dịch, ghi chú)',
    example: 'Hội phí',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Từ ngày thanh toán',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'Đến ngày thanh toán',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Số trang',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng bản ghi mỗi trang',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sắp xếp theo trường',
    example: 'paymentDate',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'paymentDate';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
