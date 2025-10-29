import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDecimal,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePaymentHistoryDto {
  @ApiProperty({
    description: 'ID của hội viên',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  memberId: string;

  @ApiProperty({
    description: 'Năm hội phí',
    example: 2024,
    minimum: 2000,
    maximum: 2100,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  paymentYear: number;

  @ApiProperty({
    description: 'Tên giao dịch thanh toán',
    example: 'Hội phí năm 2024 - Công ty ABC',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentName?: string;

  @ApiProperty({
    description: 'Mã giao dịch thanh toán',
    example: 'VCCI-PAY-2024-001',
  })
  @IsString()
  paymentCode: string;

  @ApiProperty({
    description: 'Số tiền thanh toán',
    example: 500000,
  })

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Ngày thanh toán',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({
    description: 'Hình thức thanh toán',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiProperty({
    description: 'Trạng thái thanh toán',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Thanh toán hội phí năm 2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Danh sách ID file đính kèm',
    example: ['file1', 'file2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}
