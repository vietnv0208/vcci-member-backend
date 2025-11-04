import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { MembersRepository } from './members.repository';
import {
  CreateMemberDto,
  UpdateMemberDto,
  QueryMemberDto,
  MemberResponseDto,
  MemberListResponseDto,
  ChangeMemberStatusDto,
  ActivateMemberDto,
  UpsertMemberDto,
} from './dto';
import { CreatePaymentHistoryDto } from './payment-history/dto/create-payment-history.dto';
import {
  Prisma,
  MemberStatus,
  FeeStatus,
  EntityType,
  UserRole,
  ApplicationType,
} from '@prisma/client';
import { FilesService } from '../common/file-management';
import {
  ActivityLogService,
  ActivityActionType,
  ActivityTargetType,
} from '../common/activity-log';
import {
  getChangedFields,
  hasArrayOfObjectsChanges,
  hasObjectChanges,
  hasSetChanges,
} from '../common/activity-log';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ProfileResponseDto } from '../../auth/dto/profile-response.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly filesService: FilesService,
    private readonly activityLogService: ActivityLogService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Helper function để map ApplicationType sang tên tiếng Việt
   */
  private getApplicationTypeName(applicationType: ApplicationType): string {
    const typeMap: Record<ApplicationType, string> = {
      [ApplicationType.ENTERPRISE]: 'Doanh nghiệp',
      [ApplicationType.ASSOCIATION]: 'Hiệp hội',
    };
    return typeMap[applicationType] || applicationType;
  }

  async create(
    createMemberDto: CreateMemberDto,
    userId?: string,
  ): Promise<MemberResponseDto> {
    const {
      enterpriseDetail,
      associationDetail,
      contacts,
      businessCategoryIds,
      branchCategoryId,
      ...memberData
    } = createMemberDto;

    // Validate application type matches detail type
    if (createMemberDto.applicationType === 'ENTERPRISE' && !enterpriseDetail) {
      throw new BadRequestException(
        'Thông tin doanh nghiệp là bắt buộc cho loại đơn đăng ký DOANH NGHIỆP',
      );
    }

    if (
      createMemberDto.applicationType === 'ASSOCIATION' &&
      !associationDetail
    ) {
      throw new BadRequestException(
        'Thông tin hiệp hội là bắt buộc cho loại đơn đăng ký HIỆP HỘI',
      );
    }

    // // Check if email already exists
    // const existingMember = await this.membersRepository.findMany({
    //   search: createMemberDto.email,
    //   page: 1,
    //   limit: 1,
    // });
    //
    // if (existingMember.total > 0) {
    //   throw new ConflictException('Email đã tồn tại trong hệ thống');
    // }

    // Generate member code
    // const code = await this.membersRepository.generateMemberCode();
    const applicationCode =
      await this.membersRepository.generateApplicationCode();

    // Build create data
    const createData: Prisma.MemberCreateInput = {
      ...memberData,
      applicationCode,
      contacts: {
        create: contacts,
      },
    };

    // Set branch category if provided
    if (branchCategoryId) {
      const exists = await this.prisma.branchCategory.findUnique({
        where: { id: branchCategoryId },
      });
      if (!exists) {
        throw new BadRequestException('Chi nhánh không tồn tại');
      }
      createData.branchCategory = { connect: { id: branchCategoryId } } as any;
    }

    // Add enterprise detail if exists
    if (enterpriseDetail) {
      createData.enterpriseDetail = {
        create: enterpriseDetail,
      };
    }

    // Add association detail if exists
    if (associationDetail) {
      createData.associationDetail = {
        create: associationDetail,
      };
    }

    // Add business categories if exists
    if (businessCategoryIds && businessCategoryIds.length > 0) {
      createData.memberBusinessCategories = {
        create: businessCategoryIds.map((categoryId) => ({
          businessCategory: {
            connect: { id: categoryId },
          },
        })),
      };
    }

    // Create initial status history
    createData.statusHistories = {
      create: {
        status: MemberStatus.PENDING,
        remark: 'Đơn đăng ký mới',
        changedById: userId,
      },
    };

    const member = await this.membersRepository.create(createData);
    if (
      createMemberDto.attachmentIds &&
      createMemberDto.attachmentIds.length > 0
    ) {
      await this.filesService.attachByFileIds(
        createMemberDto.attachmentIds,
        'MEMBER',
        member.id,
      );

      // Log update attachment
      await this.activityLogService.logActivity(
        ActivityActionType.UPDATE_ATTACHMENT,
        {
          memberCode: member.applicationCode,
          memberName: member.vietnameseName,
          fileName: `${createMemberDto.attachmentIds.length} tệp đính kèm`,
        },
        {
          targetType: ActivityTargetType.MEMBER,
          targetId: member.id,
          userId,
        },
      );
    }

    // Log submit application
    await this.activityLogService.logActivity(
      ActivityActionType.SUBMIT_APPLICATION,
      {
        applicationTypeName: this.getApplicationTypeName(
          member.applicationType,
        ),
        memberCode: member.applicationCode,
        memberName: member.vietnameseName,
        date: new Date().toLocaleDateString('vi-VN'),
      },
      {
        targetType: ActivityTargetType.MEMBER,
        targetId: member.id,
        userId,
        requestData: createMemberDto,
      },
    );
    return this.mapToResponseDto(member);
  }

  async createMemberAccount(
    memberId: string,
    email: string,
    password: string,
    userId?: string,
  ) {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${memberId}`);
    }

    // Check if member already has an account
    const existingMemberUser = await this.prisma.user.findFirst({
      where: { memberId },
    });
    if (existingMemberUser) {
      throw new ConflictException('Hội viên này đã có tài khoản');
    }

    // Check if email is already used
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: member.vietnameseName || member.englishName || 'Hội viên',
        email,
        password: hashedPassword,
        role: UserRole.MEMBER,
        active: true,
        memberId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
    // Log submit application
    await this.activityLogService.logActivity(
      ActivityActionType.CREATE_USER_FOR_MEMBER,
      {
        memberName: member.vietnameseName || member.englishName || 'Hội viên',
        email: email,
        date: new Date().toLocaleDateString('vi-VN'),
      },
      {
        targetType: ActivityTargetType.MEMBER,
        targetId: member.id,
        userId,
      },
    );
    return user;
  }

  async findAll(query: QueryMemberDto): Promise<MemberListResponseDto> {
    const { data, total } = await this.membersRepository.findMany(query);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((member) => this.mapToResponseDto(member)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<MemberResponseDto> {
    const member = await this.membersRepository.findById(id);

    if (!member) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${id}`);
    }

    return this.mapToResponseDto(member);
  }

  async findByCode(code: string): Promise<MemberResponseDto> {
    const member = await this.membersRepository.findByCode(code);

    if (!member) {
      throw new NotFoundException(`Không tìm thấy hội viên với mã ${code}`);
    }

    return this.mapToResponseDto(member);
  }

  async findByVietnameseName(name: string): Promise<MemberResponseDto> {
    const member = await this.membersRepository.findByVietnameseNameExact(name);

    if (!member) {
      throw new NotFoundException(
        `Không tìm thấy hội viên với tên tiếng Việt "${name}"`,
      );
    }

    return this.mapToResponseDto(member);
  }

  async findByApplicationCode(
    applicationCode: string,
  ): Promise<MemberResponseDto> {
    const member =
      await this.membersRepository.findByApplicationCode(applicationCode);

    if (!member) {
      throw new NotFoundException(
        `Không tìm thấy hội viên với mã đơn đăng ký ${applicationCode}`,
      );
    }

    return this.mapToResponseDto(member);
  }

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    const existingMember = await this.membersRepository.findById(id);

    if (!existingMember) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${id}`);
    }

    const {
      enterpriseDetail,
      associationDetail,
      contacts,
      businessCategoryIds,
      branchCategoryId,
      ...memberData
    } = updateMemberDto;

    // Validate application type matches detail type
    const applicationType =
      updateMemberDto.applicationType || existingMember.applicationType;
    const hasEnterpriseDetail =
      enterpriseDetail || (existingMember as any).enterpriseDetail;
    const hasAssociationDetail =
      associationDetail || (existingMember as any).associationDetail;

    if (applicationType === 'ENTERPRISE' && !hasEnterpriseDetail) {
      throw new BadRequestException(
        'Thông tin doanh nghiệp là bắt buộc cho loại đơn đăng ký DOANH NGHIỆP',
      );
    }

    if (applicationType === 'ASSOCIATION' && !hasAssociationDetail) {
      throw new BadRequestException(
        'Thông tin hiệp hội là bắt buộc cho loại đơn đăng ký HIỆP HỘI',
      );
    }

    // Build update data
    const updateData: Prisma.MemberUpdateInput = {
      ...memberData,
    };

    // Update branch category
    if (typeof branchCategoryId !== 'undefined') {
      if (branchCategoryId === null || branchCategoryId === '') {
        updateData.branchCategory = { disconnect: true } as any;
      } else {
        const exists = await this.prisma.branchCategory.findUnique({
          where: { id: branchCategoryId },
        });
        if (!exists) {
          throw new BadRequestException('Chi nhánh không tồn tại');
        }
        updateData.branchCategory = {
          connect: { id: branchCategoryId },
        } as any;
      }
    }

    // Update enterprise detail
    if (enterpriseDetail) {
      if ((existingMember as any).enterpriseDetail) {
        updateData.enterpriseDetail = {
          update: enterpriseDetail,
        };
      } else {
        updateData.enterpriseDetail = {
          create: enterpriseDetail,
        };
      }
    }

    // Update association detail
    if (associationDetail) {
      if ((existingMember as any).associationDetail) {
        updateData.associationDetail = {
          update: associationDetail,
        };
      } else {
        updateData.associationDetail = {
          create: associationDetail,
        };
      }
    }

    // Update contacts
    if (contacts) {
      updateData.contacts = {
        deleteMany: {},
        create: contacts,
      };
    }

    // Update business categories
    if (businessCategoryIds) {
      updateData.memberBusinessCategories = {
        deleteMany: {},
        create: businessCategoryIds.map((categoryId) => ({
          businessCategory: {
            connect: { id: categoryId },
          },
        })),
      };
    }

    const member = await this.membersRepository.update(id, updateData);
    // Log edit basic info with changed fields
    const basicChangedFields = getChangedFields(
      memberData || {},
      existingMember,
    );

    const extraChangedFields: string[] = [];
    if (enterpriseDetail) {
      const oldEnterprise = (existingMember as any).enterpriseDetail || {};
      if (hasObjectChanges(enterpriseDetail, oldEnterprise)) {
        extraChangedFields.push('enterpriseDetail');
      }
    }
    if (associationDetail) {
      const oldAssociation = (existingMember as any).associationDetail || {};
      if (hasObjectChanges(associationDetail, oldAssociation)) {
        extraChangedFields.push('associationDetail');
      }
    }
    if (contacts) {
      const oldContacts = (existingMember as any).contacts || [];
      if (hasArrayOfObjectsChanges(contacts, oldContacts)) {
        extraChangedFields.push('contacts');
      }
    }
    if (businessCategoryIds) {
      const oldCategoryIds = (
        (existingMember as any).memberBusinessCategories || []
      )
        .map((mbc: any) => mbc.businessCategory?.id || mbc.businessCategoryId)
        .filter(Boolean);
      if (hasSetChanges(businessCategoryIds, oldCategoryIds)) {
        extraChangedFields.push('businessCategoryIds');
      }
    }

    const changedFields = Array.from(
      new Set([...basicChangedFields, ...extraChangedFields]),
    );
    if (changedFields.length > 0) {
      await this.activityLogService.logActivity(
        ActivityActionType.EDIT_BASIC_INFO,
        {
          memberCode: member.code || member.applicationCode,
          memberName: member.vietnameseName,
          // fields: changedFields.join(', '),
        },
        {
          targetType: ActivityTargetType.MEMBER,
          targetId: id,
        },
      );
    }
    return this.mapToResponseDto(member);
  }

  async remove(id: string): Promise<void> {
    const existingMember = await this.membersRepository.findById(id);

    if (!existingMember) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${id}`);
    }

    await this.membersRepository.delete(id);
  }

  async changeStatus(
    id: string,
    changeStatusDto: ChangeMemberStatusDto,
    userId?: string,
  ): Promise<MemberResponseDto> {
    const existingMember = await this.membersRepository.findById(id);

    if (!existingMember) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${id}`);
    }

    // Validate status transition
    this.validateStatusTransition(
      existingMember.status,
      changeStatusDto.status,
    );

    const member = await this.membersRepository.updateStatus(
      id,
      changeStatusDto.status,
      userId,
      changeStatusDto.remark,
    );

    // Log activity based on status change
    let action: ActivityActionType;
    let context: any = {
      memberCode: member.code || member.applicationCode,
      memberName: member.vietnameseName,
      fromStatus: existingMember.status,
      toStatus: changeStatusDto.status,
    };

    switch (changeStatusDto.status) {
      case MemberStatus.APPROVED:
        action = ActivityActionType.APPROVE_APPLICATION;
        break;
      case MemberStatus.REJECTED:
        action = ActivityActionType.REJECT_APPLICATION;
        context.reason = changeStatusDto.remark;
        break;
      case MemberStatus.SUSPENDED:
        action = ActivityActionType.MEMBER_SUSPENDED;
        context.reason = changeStatusDto.remark;
        break;
      default:
        action = ActivityActionType.EDIT_BASIC_INFO;
        context.fields = `Thay đổi trạng thái từ ${existingMember.status} sang ${changeStatusDto.status}`;
    }

    await this.activityLogService.logActivity(action, context, {
      targetType: ActivityTargetType.MEMBER,
      targetId: id,
      userId,
    });

    return this.mapToResponseDto(member);
  }

  async activateMember(
    id: string,
    paymentDto: CreatePaymentHistoryDto,
    userId?: string,
  ): Promise<MemberResponseDto> {
    const existingMember = await this.membersRepository.findById(id);

    if (!existingMember) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${id}`);
    }

    // Validate member must be in APPROVED status
    if (existingMember.status !== MemberStatus.APPROVED) {
      throw new BadRequestException(
        `Không thể kích hoạt hội viên. Trạng thái hiện tại là ${existingMember.status}. Hội viên phải ở trạng thái APPROVED.`,
      );
    }

    // Override memberId from DTO with URL param
    const paymentData = {
      ...paymentDto,
      memberId: id,
    };

    // Activate member with payment
    const { member, paymentHistory } =
      await this.membersRepository.activateMember(id, paymentData, userId);
    if (
      paymentDto.attachmentIds &&
      paymentDto.attachmentIds.length > 0 &&
      paymentHistory?.id
    ) {
      await this.filesService.attachByFileIds(
        paymentDto.attachmentIds,
        EntityType.MEMBER_PAYMENT,
        paymentHistory.id,
      );

      // Log update attachment for activation
      await this.activityLogService.logActivity(
        ActivityActionType.UPDATE_ATTACHMENT,
        {
          memberCode: member.code,
          memberName: member.vietnameseName,
          fileName: `${paymentDto.attachmentIds.length} tệp đính kèm`,
        },
        {
          targetType: ActivityTargetType.MEMBER,
          targetId: id,
          userId,
        },
      );
    }

    // Log activation activity
    await this.activityLogService.logActivity(
      ActivityActionType.MEMBER_ACTIVATED,
      {
        memberCode: member.code || member.applicationCode,
        memberName: member.vietnameseName,
        feeAmount: paymentDto.amount,
        note: paymentDto.note,
      },
      {
        targetType: ActivityTargetType.MEMBER,
        targetId: id,
        userId,
      },
    );

    return this.mapToResponseDto(member);
  }

  async getStatistics() {
    return this.membersRepository.getStatistics();
  }

  async bulkUpsert(dtos: UpsertMemberDto[], userId?: string): Promise<any> {
    const details = {
      created: [] as any[],
      updated: [] as any[],
      errors: [] as any[],
    };

    for (const dto of dtos) {
      try {
        let existingId: string | null = null;

        if (dto.code) {
          const byCode = await this.membersRepository.findByCode(dto.code);
          if (byCode) existingId = byCode.id;
        }
        if (!existingId && dto.vietnameseName) {
          const byName = await this.membersRepository.findByVietnameseNameExact(
            dto.vietnameseName,
          );
          if (byName) existingId = byName.id;
        }

        if (existingId) {
          const updated = await this.update(
            existingId,
            dto as unknown as UpdateMemberDto,
          );
          await this.upsertPaymentYears(updated.id, dto.paymentYears);
          details.updated.push({
            id: updated.id,
            code: updated.code,
            applicationCode: updated.applicationCode,
            vietnameseName: updated.vietnameseName,
            action: 'updated',
          });
        } else {
          const created = await this.create(dto, userId);
          await this.upsertPaymentYears(created.id, dto.paymentYears);
          details.created.push({
            id: created.id,
            code: created.code,
            applicationCode: created.applicationCode,
            vietnameseName: created.vietnameseName,
            action: 'created',
          });
        }
      } catch (error: any) {
        details.errors.push({
          key: dto.code || dto.vietnameseName,
          error: error?.message || 'Lỗi không xác định',
        });
      }
    }

    return {
      summary: {
        total: dtos.length,
        created: details.created.length,
        updated: details.updated.length,
        errors: details.errors.length,
      },
      details,
    };
  }

  private extractYearsFromString(input?: string): number[] {
    if (!input) return [];
    const matches = input.match(/(?:19|20)\d{2}/g) || [];
    const years = matches
      .map((y) => parseInt(y, 10))
      .filter((y) => y >= 1900 && y <= 2100);
    return Array.from(new Set(years));
  }

  private async upsertPaymentYears(
    memberId: string,
    paymentYears?: string,
  ): Promise<void> {
    const years = this.extractYearsFromString(paymentYears);
    if (years.length === 0) return;

    for (const year of years) {
      const exists = await this.prisma.memberPaymentHistory.findFirst({
        where: { memberId, paymentYear: year },
        select: { id: true },
      });
      if (exists) continue;
      await this.prisma.memberPaymentHistory.create({
        data: {
          memberId,
          paymentYear: year,
          paymentName: `Hội phí năm ${year}`,
          note: `Nhập từ file excel`,
          attachmentIds: [],
        },
      });
    }
  }

  private validateStatusTransition(
    currentStatus: MemberStatus,
    newStatus: MemberStatus,
  ): void {
    const validTransitions: Record<MemberStatus, MemberStatus[]> = {
      PENDING: [
        MemberStatus.APPROVED,
        MemberStatus.REJECTED,
        MemberStatus.CANCELLED,
      ],
      APPROVED: [MemberStatus.ACTIVE, MemberStatus.REJECTED],
      REJECTED: [MemberStatus.PENDING],
      CANCELLED: [MemberStatus.PENDING],
      ACTIVE: [
        // MemberStatus.INACTIVE,
        MemberStatus.SUSPENDED,
      ],
      // INACTIVE: [MemberStatus.ACTIVE, MemberStatus.TERMINATED],
      SUSPENDED: [
        MemberStatus.ACTIVE,
        // , MemberStatus.TERMINATED
      ],
      // TERMINATED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}`,
      );
    }
  }

  private mapToResponseDto(member: any): MemberResponseDto {
    // Map business categories từ memberBusinessCategories relation
    const businessCategories = (member.memberBusinessCategories || []).map(
      (mbc: any) => ({
        id: mbc.businessCategory.id,
        code: mbc.businessCategory.code,
        name: mbc.businessCategory.name,
        level: mbc.businessCategory.level,
        parentId: mbc.businessCategory.parentId,
        isActive: mbc.businessCategory.isActive,
      }),
    );

    const primaryUser =
      Array.isArray(member.User) && member.User.length > 0
        ? member.User[0]
        : undefined;

    return {
      id: member.id,
      code: member.code,
      applicationCode: member.applicationCode,
      applicationType: member.applicationType,
      memberType: member.memberType,
      status: member.status,
      vietnameseName: member.vietnameseName,
      englishName: member.englishName,
      abbreviation: member.abbreviation,
      officeAddress: member.officeAddress,
      businessAddress: member.businessAddress,
      telephone: member.telephone,
      email: member.email,
      website: member.website,
      taxCode: member.taxCode,
      classification: member.classification,
      submittedDate: member.submittedDate,
      approvedDate: member.approvedDate,
      joinDate: member.joinDate,
      expireDate: member.expireDate,
      remarks: member.remarks,
      branchCategory: member.branchCategory
        ? {
            id: member.branchCategory.id,
            name: member.branchCategory.name,
            address: member.branchCategory.address,
          }
        : undefined,
      enterpriseDetail: member.enterpriseDetail,
      associationDetail: member.associationDetail,
      contacts: member.contacts || [],
      businessCategories,
      memberPaymentHistory: member.memberPaymentHistory,
      attachmentIds: member.attachmentIds || [],
      user: primaryUser
        ? {
            fullName: primaryUser.fullName,
            email: primaryUser.email,
          }
        : undefined,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  async findMyApplicationByUserId(id: string): Promise<MemberResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        role: true,
        email: true,
        department: true,
        active: true,
        deleted: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        memberId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let member: MemberResponseDto = {} as MemberResponseDto;
    if (user.memberId) {
      member = await this.findOne((user as any).memberId);
    }

    return member;
  }
}
