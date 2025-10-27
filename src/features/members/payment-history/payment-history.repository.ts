import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Prisma, MemberPaymentHistory } from '@prisma/client';
import { CreatePaymentHistoryDto, QueryPaymentHistoryDto } from './dto';

@Injectable()
export class PaymentHistoryRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePaymentHistoryDto): Promise<MemberPaymentHistory> {
    return this.prisma.memberPaymentHistory.create({
      data: {
        ...data,
        paymentDate: new Date(data.paymentDate),
      },
      include: {
        member: {
          select: {
            id: true,
            vietnameseName: true,
            code: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<MemberPaymentHistory | null> {
    return this.prisma.memberPaymentHistory.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            vietnameseName: true,
            code: true,
          },
        },
      },
    });
  }

  async findMany(query: QueryPaymentHistoryDto) {
    const {
      memberId,
      paymentYear,
      paymentName,
      paymentCode,
      method,
      status,
      search,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện where
    const where: Prisma.MemberPaymentHistoryWhereInput = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (paymentYear) {
      where.paymentYear = paymentYear;
    }

    if (paymentName) {
      where.paymentName = {
        contains: paymentName,
        mode: 'insensitive',
      };
    }

    if (paymentCode) {
      where.paymentCode = {
        contains: paymentCode,
        mode: 'insensitive',
      };
    }

    if (method) {
      where.method = method;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) {
        where.paymentDate.gte = new Date(fromDate);
      }
      if (toDate) {
        where.paymentDate.lte = new Date(toDate);
      }
    }

    if (search) {
      where.OR = [
        {
          paymentName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          paymentCode: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          note: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          member: {
            vietnameseName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          member: {
            code: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Xây dựng điều kiện sắp xếp
    const orderBy: Prisma.MemberPaymentHistoryOrderByWithRelationInput = {};
    if (sortBy === 'member') {
      orderBy.member = {
        vietnameseName: sortOrder,
      };
    } else {
      orderBy[sortBy as keyof Prisma.MemberPaymentHistoryOrderByWithRelationInput] = sortOrder;
    }

    const [data, total] = await Promise.all([
      this.prisma.memberPaymentHistory.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          member: {
            select: {
              id: true,
              vietnameseName: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.memberPaymentHistory.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Partial<CreatePaymentHistoryDto>): Promise<MemberPaymentHistory> {
    const updateData: Prisma.MemberPaymentHistoryUpdateInput = { ...data };
    
    if (data.paymentDate) {
      updateData.paymentDate = new Date(data.paymentDate);
    }

    return this.prisma.memberPaymentHistory.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            vietnameseName: true,
            code: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<MemberPaymentHistory> {
    return this.prisma.memberPaymentHistory.delete({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            vietnameseName: true,
            code: true,
          },
        },
      },
    });
  }

  async findByMemberId(memberId: string, year?: number) {
    const where: Prisma.MemberPaymentHistoryWhereInput = {
      memberId,
    };

    if (year) {
      where.paymentYear = year;
    }

    return this.prisma.memberPaymentHistory.findMany({
      where,
      orderBy: {
        paymentDate: 'desc',
      },
      include: {
        member: {
          select: {
            id: true,
            vietnameseName: true,
            code: true,
          },
        },
      },
    });
  }

  async findByPaymentCode(paymentCode: string): Promise<MemberPaymentHistory | null> {
    return this.prisma.memberPaymentHistory.findUnique({
      where: { paymentCode },
      include: {
        member: {
          select: {
            id: true,
            vietnameseName: true,
            code: true,
          },
        },
      },
    });
  }

  async getPaymentSummary(memberId?: string, year?: number) {
    const where: Prisma.MemberPaymentHistoryWhereInput = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (year) {
      where.paymentYear = year;
    }

    const [totalAmount, totalCount, paidCount, pendingCount, cancelledCount] = await Promise.all([
      this.prisma.memberPaymentHistory.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      this.prisma.memberPaymentHistory.count({ where }),
      this.prisma.memberPaymentHistory.count({
        where: { ...where, status: 'PAID' },
      }),
      this.prisma.memberPaymentHistory.count({
        where: { ...where, status: 'PENDING' },
      }),
      this.prisma.memberPaymentHistory.count({
        where: { ...where, status: 'CANCELLED' },
      }),
    ]);

    return {
      totalAmount: totalAmount._sum.amount || 0,
      totalCount,
      paidCount,
      pendingCount,
      cancelledCount,
    };
  }

  async checkDuplicatePaymentCode(paymentCode: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.MemberPaymentHistoryWhereInput = {
      paymentCode,
    };

    if (excludeId) {
      where.id = {
        not: excludeId,
      };
    }

    const count = await this.prisma.memberPaymentHistory.count({ where });
    return count > 0;
  }
}
