import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { MembersService } from '../members/members.service';
import { MemberResponseDto } from '../members/dto/member-response.dto';
import { ProfileResponseDto } from '../../auth/dto/profile-response.dto';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  ChangePasswordDto,
  UpdateUserStatusDto,
  ResetPasswordDto,
} from './dto';

export interface PaginatedUsers {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private membersService: MembersService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        active: createUserDto.active ?? true,
      },
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
      },
    });

    return user;
  }

  async findAll(queryDto: QueryUserDto): Promise<PaginatedUsers> {
    const {
      search,
      role,
      active,
      department,
      includeDeleted = false,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (!includeDeleted) {
      where.deleted = false;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role !== undefined) {
      where.role = role;
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users with pagination
    const users = await this.prisma.user.findMany({
      where,
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
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string) {
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
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findProfileById(id: string): Promise<ProfileResponseDto> {
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

    let member: MemberResponseDto | null = null;
    if ((user as any).memberId) {
      member = await this.membersService.findOne((user as any).memberId);
    }

    const { memberId, ...userBase } = user as any;
    return {
      ...userBase,
      member,
    } as ProfileResponseDto;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (
      updateUserDto.email &&
      updateUserDto.email !== existingUser.email
    ) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (userWithEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Prepare update data
    const updateData: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);

      // Revoke all refresh tokens when password is changed
      await this.prisma.refreshToken.deleteMany({
        where: { userId: id },
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
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
      },
    });

    return updatedUser;
  }

  async updateStatus(id: string, updateStatusDto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { active: updateStatusDto.active },
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
      },
    });

    // If deactivating user, revoke all refresh tokens
    if (!updateStatusDto.active) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: id },
      });
    }

    return updatedUser;
  }

  async resetPassword(id: string, resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    // Revoke all refresh tokens when password is reset
    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    return { message: 'Password reset successfully' };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete: set deleted to true and active to false
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: {
        deleted: true,
        active: false,
      },
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
      },
    });

    // Revoke all refresh tokens for deleted user
    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    return deletedUser;
  }

  async restore(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deleted) {
      throw new BadRequestException('User is not deleted');
    }

    const restoredUser = await this.prisma.user.update({
      where: { id },
      data: {
        deleted: false,
        active: true,
      },
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
      },
    });

    return restoredUser;
  }

  async hardDelete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all refresh tokens first
    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    // Hard delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User permanently deleted' };
  }

  async getStats() {
    const [total, active, inactive, deleted, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { active: true, deleted: false } }),
      this.prisma.user.count({ where: { active: false, deleted: false } }),
      this.prisma.user.count({ where: { deleted: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { deleted: false },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      deleted,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {}),
    };
  }
}
