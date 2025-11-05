import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PaymentHistoryRepository } from './payment-history.repository';
import { ActivityLogService } from '../../common/activity-log';
import { ActivityActionType, ActivityTargetType } from '../../common/activity-log';
import { PrismaService } from '../../../common/prisma.service';
import {
  CreatePaymentHistoryDto,
  UpdatePaymentHistoryDto,
  QueryPaymentHistoryDto,
  PaymentHistoryResponseDto,
} from './dto';

@Injectable()
export class PaymentHistoryService {
  constructor(
    private paymentHistoryRepository: PaymentHistoryRepository,
    private prisma: PrismaService,
    private activityLogService: ActivityLogService,
  ) {}

  async create(createPaymentHistoryDto: CreatePaymentHistoryDto): Promise<PaymentHistoryResponseDto> {
    // Kiểm tra hội viên có tồn tại không
    const member = await this.prisma.member.findUnique({
      where: { id: createPaymentHistoryDto.memberId },
    });

    if (!member) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${createPaymentHistoryDto.memberId}`);
    }
    //
    // // Kiểm tra mã giao dịch đã tồn tại chưa
    // const existingPayment = await this.paymentHistoryRepository.findByPaymentCode(
    //   createPaymentHistoryDto.paymentCode,
    // );
    //
    // if (existingPayment) {
    //   throw new ConflictException(`Mã giao dịch ${createPaymentHistoryDto.paymentCode} đã tồn tại trong hệ thống`);
    // }

    // Tạo lịch sử thanh toán
    const paymentHistory = await this.paymentHistoryRepository.create(createPaymentHistoryDto);

    // Log pay annual fee / multi years
    const isMultiYears = !createPaymentHistoryDto.paymentYear;
    await this.activityLogService.logActivity(
      isMultiYears
        ? ActivityActionType.PAY_MULTI_YEARS
        : ActivityActionType.PAY_ANNUAL_FEE,
      {
        memberName: member.vietnameseName,
        memberCode: member.code || member.applicationCode,
        year: createPaymentHistoryDto.paymentYear,
        // For PAY_MULTI_YEARS, years should be a formatted string (e.g., "2024, 2025, 2026")
        // Currently paymentYear is required, so this will be a single year
        // In the future, if multi-year payment is implemented, this should be an array formatted as string
        years: createPaymentHistoryDto.paymentYear
          ? String(createPaymentHistoryDto.paymentYear)
          : '',
        amount: createPaymentHistoryDto.amount,
      },
      {
        targetType: ActivityTargetType.MEMBER,
        targetId: createPaymentHistoryDto.memberId,
      },
    );

    return {
      ...paymentHistory,
      amount: Number(paymentHistory.amount),
      paymentName: paymentHistory.paymentName,
      method: paymentHistory.method,
      status: paymentHistory.status,
      note: paymentHistory.note,
    };
  }

  async findAll(query: QueryPaymentHistoryDto) {
    const result = await this.paymentHistoryRepository.findMany(query);
    
    return {
      ...result,
      data: result.data.map(item => ({
        ...item,
        amount: Number(item.amount),
        paymentName: item.paymentName,
        method: item.method,
        status: item.status,
        note: item.note,
      })),
    };
  }

  async findOne(id: string): Promise<PaymentHistoryResponseDto> {
    const paymentHistory = await this.paymentHistoryRepository.findById(id);

    if (!paymentHistory) {
      throw new NotFoundException(`Không tìm thấy lịch sử thanh toán với ID ${id}`);
    }

    return {
      ...paymentHistory,
      amount: Number(paymentHistory.amount),
      paymentName: paymentHistory.paymentName,
      method: paymentHistory.method,
      status: paymentHistory.status,
      note: paymentHistory.note,
    };
  }

  async update(id: string, updatePaymentHistoryDto: UpdatePaymentHistoryDto): Promise<PaymentHistoryResponseDto> {
    // Kiểm tra lịch sử thanh toán có tồn tại không
    const existingPayment = await this.paymentHistoryRepository.findById(id);
    if (!existingPayment) {
      throw new NotFoundException(`Không tìm thấy lịch sử thanh toán với ID ${id}`);
    }

    // Nếu cập nhật memberId, kiểm tra hội viên có tồn tại không
    if (updatePaymentHistoryDto.memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: updatePaymentHistoryDto.memberId },
      });

      if (!member) {
        throw new NotFoundException(`Không tìm thấy hội viên với ID ${updatePaymentHistoryDto.memberId}`);
      }
    }

    // // Nếu cập nhật paymentCode, kiểm tra trùng lặp
    // if (updatePaymentHistoryDto.paymentCode) {
    //   const isDuplicate = await this.paymentHistoryRepository.checkDuplicatePaymentCode(
    //     updatePaymentHistoryDto.paymentCode,
    //     id,
    //   );
    //
    //   if (isDuplicate) {
    //     throw new ConflictException(`Mã giao dịch ${updatePaymentHistoryDto.paymentCode} đã tồn tại trong hệ thống`);
    //   }
    // }

    const updatedPaymentHistory = await this.paymentHistoryRepository.update(id, updatePaymentHistoryDto);

    return {
      ...updatedPaymentHistory,
      amount: Number(updatedPaymentHistory.amount),
      method: updatedPaymentHistory.method,
      status: updatedPaymentHistory.status,
      note: updatedPaymentHistory.note,
    };
  }

  async remove(id: string): Promise<PaymentHistoryResponseDto> {
    // Kiểm tra lịch sử thanh toán có tồn tại không
    const existingPayment = await this.paymentHistoryRepository.findById(id);
    if (!existingPayment) {
      throw new NotFoundException(`Không tìm thấy lịch sử thanh toán với ID ${id}`);
    }

    const deletedPaymentHistory = await this.paymentHistoryRepository.delete(id);

    return {
      ...deletedPaymentHistory,
      amount: Number(deletedPaymentHistory.amount),
      method: deletedPaymentHistory.method,
      status: deletedPaymentHistory.status,
      note: deletedPaymentHistory.note,
    };
  }

  async findByMemberId(memberId: string, year?: number): Promise<PaymentHistoryResponseDto[]> {
    // Kiểm tra hội viên có tồn tại không
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${memberId}`);
    }

    const paymentHistories = await this.paymentHistoryRepository.findByMemberId(memberId, year);
    
    return paymentHistories.map(item => ({
      ...item,
      amount: Number(item.amount),
      paymentName: item.paymentName,
      method: item.method,
      status: item.status,
      note: item.note,
    }));
  }

  async getPaymentSummary(memberId?: string, year?: number) {
    if (memberId) {
      // Kiểm tra hội viên có tồn tại không
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Không tìm thấy hội viên với ID ${memberId}`);
      }
    }

    return this.paymentHistoryRepository.getPaymentSummary(memberId, year);
  }

  async generatePaymentCode(year: number): Promise<string> {
    // Tìm số thứ tự cao nhất trong năm
    const lastPayment = await this.prisma.memberPaymentHistory.findFirst({
      where: {
        paymentYear: year,
        paymentCode: {
          startsWith: `VCCI-PAY-${year}-`,
        },
      },
      orderBy: {
        paymentCode: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastPayment) {
      // Lấy số cuối cùng từ mã giao dịch cuối cùng
      const lastNumber = parseInt(lastPayment.paymentCode?.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `VCCI-PAY-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async validatePaymentData(data: CreatePaymentHistoryDto | UpdatePaymentHistoryDto) {
    const errors: string[] = [];

    // Kiểm tra ngày thanh toán không được trong tương lai
    if (data.paymentDate) {
      const paymentDate = new Date(data.paymentDate);
      const now = new Date();
      
      if (paymentDate > now) {
        errors.push('Ngày thanh toán không được trong tương lai');
      }
    }

    // Kiểm tra số tiền phải lớn hơn 0
    if (data.amount !== undefined && data.amount <= 0) {
      errors.push('Số tiền thanh toán phải lớn hơn 0');
    }

    // Kiểm tra năm hội phí hợp lệ
    if (data.paymentYear !== undefined) {
      const currentYear = new Date().getFullYear();
      if (data.paymentYear < 2000 || data.paymentYear > currentYear + 1) {
        errors.push(`Năm hội phí phải từ 2000 đến ${currentYear + 1}`);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }
  }
}
