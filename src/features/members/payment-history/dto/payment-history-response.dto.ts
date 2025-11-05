import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentHistoryResponseDto {
  @ApiProperty({
    description: 'ID của lịch sử thanh toán',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'ID của hội viên',
    example: 'clx1234567890abcdef',
  })
  memberId: string;

  @ApiProperty({
    description: 'Năm hội phí',
    example: 2024,
  })
  paymentYear: number;

  @ApiProperty({
    description: 'Tên giao dịch thanh toán',
    example: 'Hội phí năm 2024 - Công ty ABC',
    required: false,
  })
  paymentName: string | null;

  @ApiProperty({
    description: 'Mã giao dịch thanh toán',
    example: 'VCCI-PAY-2024-001',
    required: false,
  })
  paymentCode: string | null;

  @ApiProperty({
    description: 'Số tiền thanh toán',
    example: 500000,
  })
  amount: number;

  @ApiProperty({
    description: 'Ngày thanh toán',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  paymentDate: Date | null;

  @ApiProperty({
    description: 'Hình thức thanh toán',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    required: false,
  })
  method: PaymentMethod | null;

  @ApiProperty({
    description: 'Trạng thái thanh toán',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    required: false,
  })
  status: PaymentStatus | null;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Thanh toán hội phí năm 2024',
    required: false,
  })
  note: string | null;

  @ApiProperty({
    description: 'Danh sách ID file đính kèm',
    example: ['file1', 'file2'],
  })
  attachmentIds: string[];

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Thông tin hội viên',
    required: false,
  })
  member?: {
    id: string;
    vietnameseName: string;
    code: string | null;
  };
}
