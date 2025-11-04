import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  Prisma,
  Member,
  MemberStatus,
  FeeStatus,
  PaymentStatus,
  MemberPaymentHistory,
  PaymentMethod,
} from '@prisma/client';
import { ActivateMemberDto, QueryMemberDto } from './dto';
import { BusinessCategoriesService } from '../business-categories/business-categories.service';
import { CreatePaymentHistoryDto } from './payment-history/dto/create-payment-history.dto';

@Injectable()
export class MembersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessCategoriesService: BusinessCategoriesService,
  ) {}

  async create(data: Prisma.MemberCreateInput): Promise<Member> {
    return this.prisma.member.create({
      data,
      include: {
        enterpriseDetail: true,
        associationDetail: true,
        contacts: true,
        branchCategory: true,
        User: {
          select: { id: true, fullName: true, email: true },
        },
        statusHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            changedAt: 'desc',
          },
        },
        memberBusinessCategories: {
          include: {
            businessCategory: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Member | null> {
    return this.prisma.member.findUnique({
      where: { id },
      include: {
        enterpriseDetail: true,
        associationDetail: true,
        contacts: true,
        branchCategory: true,
        User: {
          select: { id: true, fullName: true, email: true },
        },
        statusHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            changedAt: 'desc',
          },
        },
        memberBusinessCategories: {
          include: {
            businessCategory: true,
          },
        },
        memberPaymentHistory: true,
      },
    });
  }

  async findByCode(code: string): Promise<Member | null> {
    return this.prisma.member.findUnique({
      where: { code },
      include: {
        enterpriseDetail: true,
        associationDetail: true,
        contacts: true,
        branchCategory: true,
        User: {
          select: { id: true, fullName: true, email: true },
        },
        statusHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            changedAt: 'desc',
          },
        },
        memberBusinessCategories: {
          include: {
            businessCategory: true,
          },
        },
      },
    });
  }

  async findByApplicationCode(applicationCode: string): Promise<Member | null> {
    return this.prisma.member.findUnique({
      where: { applicationCode },
      include: {
        enterpriseDetail: true,
        associationDetail: true,
        contacts: true,
        branchCategory: true,
        User: {
          select: { id: true, fullName: true, email: true },
        },
        statusHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            changedAt: 'desc',
          },
        },
        memberBusinessCategories: {
          include: {
            businessCategory: true,
          },
        },
        memberPaymentHistory: true,
      },
    });
  }

  async findMany(
    query: QueryMemberDto,
  ): Promise<{ data: Member[]; total: number }> {
    const {
      search,
      applicationType,
      memberType,
      status,
      classification,
      businessCategoryId,
      branchCategoryId,
      submittedDateFrom,
      submittedDateTo,
      approvedDateFrom,
      approvedDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where condition
    const where: Prisma.MemberWhereInput = {};

    if (search) {
      where.OR = [
        { vietnameseName: { contains: search, mode: 'insensitive' } },
        { englishName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { taxCode: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { applicationCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (branchCategoryId) {
      where.branchCategoryId = branchCategoryId;
    }

    if (applicationType) {
      where.applicationType = applicationType;
    }

    if (memberType) {
      where.memberType = memberType;
    }

    if (status) {
      where.status = status;
    }

    if (classification) {
      where.classification = classification;
    }

    // Filter by business category (including descendants)
    if (businessCategoryId) {
      // Lấy tất cả descendant IDs (bao gồm cả chính nó)
      const categoryIds =
        await this.businessCategoriesService.getAllDescendantIds(
          businessCategoryId,
        );

      // Filter members có ít nhất 1 category trong danh sách
      where.memberBusinessCategories = {
        some: {
          businessCategoryId: {
            in: categoryIds,
          },
        },
      };
    }

    if (submittedDateFrom || submittedDateTo) {
      where.submittedDate = {};
      if (submittedDateFrom) {
        where.submittedDate.gte = new Date(submittedDateFrom);
      }
      if (submittedDateTo) {
        where.submittedDate.lte = new Date(submittedDateTo);
      }
    }

    if (approvedDateFrom || approvedDateTo) {
      where.approvedDate = {};
      if (approvedDateFrom) {
        where.approvedDate.gte = new Date(approvedDateFrom);
      }
      if (approvedDateTo) {
        where.approvedDate.lte = new Date(approvedDateTo);
      }
    }

    // Build orderBy
    const orderBy: Prisma.MemberOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.MemberOrderByWithRelationInput] = sortOrder;

    const [data, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          enterpriseDetail: true,
          associationDetail: true,
          contacts: true,
          branchCategory: true,
          User: {
            select: { id: true, fullName: true, email: true },
          },
          statusHistories: {
            include: {
              changedBy: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
            orderBy: {
              changedAt: 'desc',
            },
            take: 1, // Chỉ lấy lịch sử gần nhất
          },
          memberBusinessCategories: {
            include: {
              businessCategory: true,
            },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, data: Prisma.MemberUpdateInput): Promise<Member> {
    return this.prisma.member.update({
      where: { id },
      data,
      include: {
        enterpriseDetail: true,
        associationDetail: true,
        contacts: true,
        branchCategory: true,
        statusHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            changedAt: 'desc',
          },
        },
        memberBusinessCategories: {
          include: {
            businessCategory: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Member> {
    return this.prisma.member.delete({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: MemberStatus,
    changedById?: string,
    remark?: string,
  ): Promise<Member> {
    return this.prisma.$transaction(async (tx) => {
      // Update member status
      const member = await tx.member.update({
        where: { id },
        data: {
          status,
          ...(status === 'APPROVED' && { approvedDate: new Date() }),
          ...(status === 'ACTIVE' && { joinDate: new Date() }),
        },
        include: {
          enterpriseDetail: true,
          associationDetail: true,
          contacts: true,
          User: {
            select: { id: true, fullName: true, email: true },
          },
          statusHistories: {
            include: {
              changedBy: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
            orderBy: {
              changedAt: 'desc',
            },
          },
          memberBusinessCategories: {
            include: {
              businessCategory: true,
            },
          },
        },
      });

      // Create status history record
      await tx.memberStatusHistory.create({
        data: {
          memberId: id,
          status,
          remark,
          changedById,
        },
      });

      return member;
    });
  }

  async activateMember(
    id: string,
    paymentDto: ActivateMemberDto,
    changedById?: string,
  ): Promise<{ member: Member; paymentHistory: MemberPaymentHistory }> {
    const code = await this.generateMemberCode();

    return this.prisma.$transaction(async (tx) => {
      // Use paymentYear from DTO, fallback to current year
      const paymentYear = paymentDto.paymentYear || new Date().getFullYear();
      const paymentDate = paymentDto.paymentDate ? new Date(paymentDto.paymentDate) : new Date();

      // Update member to ACTIVE status and update fee info
      const member = await tx.member.update({
        where: { id },
        data: {
          code, // set member code upon activation
          status: MemberStatus.ACTIVE,
          feeStatus: FeeStatus.PAID,
          feeAmount: paymentDto.amount,
          lastPaymentDate: paymentDate,
          joinDate: new Date(),
        },
        include: {
          enterpriseDetail: true,
          associationDetail: true,
          contacts: true,
          statusHistories: {
            include: {
              changedBy: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
            orderBy: {
              changedAt: 'desc',
            },
          },
          memberBusinessCategories: {
            include: {
              businessCategory: true,
            },
          },
        },
      });

      // Create payment history record
      const paymentHistory = await tx.memberPaymentHistory.create({
        data: {
          memberId: id,
          paymentYear: paymentYear,
          paymentName: paymentDto.paymentName || `Thanh toán hội phí lần đầu`,
          paymentCode: paymentDto.paymentCode,
          amount: paymentDto.amount,
          paymentDate: paymentDate,
          method: paymentDto.method || PaymentMethod.BANK_TRANSFER,
          status: paymentDto.status || PaymentStatus.PAID,
          note: paymentDto.note || `Hội phí năm ${paymentYear} - Kích hoạt hội viên`,
          attachmentIds: paymentDto.attachmentIds || [],
        },
      });

      // Create status history record
      await tx.memberStatusHistory.create({
        data: {
          memberId: id,
          status: MemberStatus.ACTIVE,
          remark: `Kích hoạt hội viên - Đã thanh toán hội phí năm ${paymentYear}`,
          changedById,
        },
      });

      return { member, paymentHistory };
    });
  }

  async generateMemberCode(): Promise<string> {
    // const year = new Date().getFullYear();
    const prefix = `VCCI-`;

    // Find the last member code for this year
    const lastMember = await this.prisma.member.findFirst({
      where: {
        code: {
          startsWith: prefix,
        },
      },
      orderBy: {
        code: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastMember?.code) {
      const lastNumber = parseInt(lastMember.code.replace(prefix, ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber > 9999 ? nextNumber : nextNumber.toString().padStart(4, '0')}`;
  }

  async generateApplicationCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `VCCI-REG-${year}-`;

    // Find the last member code for this year
    const lastMember = await this.prisma.member.findFirst({
      where: {
        applicationCode: {
          startsWith: prefix,
        },
      },
      orderBy: {
        applicationCode: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastMember?.applicationCode) {
      const lastNumber = parseInt(lastMember.applicationCode.replace(prefix, ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber > 9999 ? nextNumber : nextNumber.toString().padStart(4, '0')}`;
  }

  async getStatistics() {
    const [
      totalMembers,
      pendingMembers,
      approvedMembers,
      activeMembers,
      rejectedMembers,
      paidMembers,
      enterpriseMembers,
      associationMembers,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: 'PENDING' } }),
      this.prisma.member.count({ where: { status: 'APPROVED' } }),
      this.prisma.member.count({ where: { status: 'ACTIVE' } }),
      this.prisma.member.count({ where: { status: 'REJECTED' } }),
      this.prisma.member.count({ where: { feeStatus: 'PAID' } }),
      this.prisma.member.count({ where: { applicationType: 'ENTERPRISE' } }),
      this.prisma.member.count({ where: { applicationType: 'ASSOCIATION' } }),
    ]);

    return {
      totalMembers,
      pendingMembers,
      approvedMembers,
      activeMembers,
      rejectedMembers,
      paidMembers,
      enterpriseMembers,
      associationMembers,
    };
  }
}
