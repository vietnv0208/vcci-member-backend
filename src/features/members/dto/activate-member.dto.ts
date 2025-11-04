import { IsNumber, IsArray, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePaymentHistoryDto } from '../payment-history';
import { OmitType } from '@nestjs/mapped-types';

export class ActivateMemberDto extends OmitType(CreatePaymentHistoryDto, [
  'memberId',
] as const) {
  @ApiProperty({
    description: 'ID của hội viên',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  memberId?: string;

  // @ApiProperty({
  //   description: 'Số tiền hội phí',
  //   example: 5000000,
  //   minimum: 0,
  // })
  // @Type(() => Number)
  // @IsNumber()
  // @Min(0)
  // feeAmount: number;
  //
  // @ApiProperty({
  //   description: 'Danh sách ID file đính kèm (chứng từ thanh toán)',
  //   example: ['file-id-1', 'file-id-2'],
  //   type: [String],
  // })
  // @IsArray()
  // @IsString({ each: true })
  // attachmentIds: string[];
  //
  // @ApiPropertyOptional({
  //   description: 'Ghi chú cho khoản thanh toán',
  //   example: 'Hội phí năm 2024',
  // })
  // @IsOptional()
  // @IsString()
  // note?: string;
}
