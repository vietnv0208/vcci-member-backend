import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { MembersRepository } from './members.repository';
import {
  CreateMemberDto,
  UpdateMemberDto,
  QueryMemberDto,
  MemberResponseDto,
  MemberListResponseDto,
  ChangeMemberStatusDto,
} from './dto';
import { Prisma, MemberStatus } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async create(createMemberDto: CreateMemberDto, userId?: string): Promise<MemberResponseDto> {
    const { 
      enterpriseDetail, 
      associationDetail, 
      contacts, 
      businessCategoryIds,
      ...memberData 
    } = createMemberDto;

    // Validate application type matches detail type
    if (createMemberDto.applicationType === 'ENTERPRISE' && !enterpriseDetail) {
      throw new BadRequestException('Enterprise detail is required for ENTERPRISE application type');
    }

    if (createMemberDto.applicationType === 'ASSOCIATION' && !associationDetail) {
      throw new BadRequestException('Association detail is required for ASSOCIATION application type');
    }

    // Check if email already exists
    const existingMember = await this.membersRepository.findMany({
      search: createMemberDto.email,
      page: 1,
      limit: 1,
    });

    if (existingMember.total > 0) {
      throw new ConflictException('Email already exists');
    }

    // Generate member code
    const code = await this.membersRepository.generateMemberCode();

    // Build create data
    const createData: Prisma.MemberCreateInput = {
      ...memberData,
      code,
      contacts: {
        create: contacts,
      },
    };

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

    return this.mapToResponseDto(member);
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
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return this.mapToResponseDto(member);
  }

  async findByCode(code: string): Promise<MemberResponseDto> {
    const member = await this.membersRepository.findByCode(code);

    if (!member) {
      throw new NotFoundException(`Member with code ${code} not found`);
    }

    return this.mapToResponseDto(member);
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<MemberResponseDto> {
    const existingMember = await this.membersRepository.findById(id);

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    const { 
      enterpriseDetail, 
      associationDetail, 
      contacts, 
      businessCategoryIds,
      ...memberData 
    } = updateMemberDto;

    // Validate application type matches detail type
    const applicationType = updateMemberDto.applicationType || existingMember.applicationType;
    const hasEnterpriseDetail = enterpriseDetail || (existingMember as any).enterpriseDetail;
    const hasAssociationDetail = associationDetail || (existingMember as any).associationDetail;

    if (applicationType === 'ENTERPRISE' && !hasEnterpriseDetail) {
      throw new BadRequestException('Enterprise detail is required for ENTERPRISE application type');
    }

    if (applicationType === 'ASSOCIATION' && !hasAssociationDetail) {
      throw new BadRequestException('Association detail is required for ASSOCIATION application type');
    }

    // Build update data
    const updateData: Prisma.MemberUpdateInput = {
      ...memberData,
    };

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

    return this.mapToResponseDto(member);
  }

  async remove(id: string): Promise<void> {
    const existingMember = await this.membersRepository.findById(id);

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
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
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(existingMember.status, changeStatusDto.status);

    const member = await this.membersRepository.updateStatus(
      id,
      changeStatusDto.status,
      userId,
      changeStatusDto.remark,
    );

    return this.mapToResponseDto(member);
  }

  async getStatistics() {
    return this.membersRepository.getStatistics();
  }

  private validateStatusTransition(currentStatus: MemberStatus, newStatus: MemberStatus): void {
    const validTransitions: Record<MemberStatus, MemberStatus[]> = {
      PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['ACTIVE', 'REJECTED'],
      REJECTED: ['PENDING'],
      CANCELLED: ['PENDING'],
      ACTIVE: ['INACTIVE', 'SUSPENDED'],
      INACTIVE: ['ACTIVE', 'TERMINATED'],
      SUSPENDED: ['ACTIVE', 'TERMINATED'],
      TERMINATED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private mapToResponseDto(member: any): MemberResponseDto {
    return {
      id: member.id,
      code: member.code,
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
      submittedDate: member.submittedDate,
      approvedDate: member.approvedDate,
      joinDate: member.joinDate,
      expireDate: member.expireDate,
      remarks: member.remarks,
      enterpriseDetail: member.enterpriseDetail,
      associationDetail: member.associationDetail,
      contacts: member.contacts || [],
      attachmentIds: member.attachmentIds || [],
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
