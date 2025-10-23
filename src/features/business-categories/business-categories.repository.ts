import { Injectable } from '@nestjs/common';
import { Prisma, BusinessCategory } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class BusinessCategoriesRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo mới business category
   */
  async create(
    data: Prisma.BusinessCategoryCreateInput,
  ): Promise<BusinessCategory> {
    return this.prisma.businessCategory.create({
      data,
      include: {
        parent: true,
      },
    });
  }

  /**
   * Tìm theo ID với options
   */
  async findById(
    id: string,
    includeChildren: boolean = false,
    includeParent: boolean = true,
  ): Promise<BusinessCategory | null> {
    return this.prisma.businessCategory.findUnique({
      where: { id },
      include: {
        parent: includeParent,
        children: includeChildren,
      },
    });
  }

  /**
   * Tìm nhiều với điều kiện
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BusinessCategoryWhereInput;
    orderBy?: Prisma.BusinessCategoryOrderByWithRelationInput | Prisma.BusinessCategoryOrderByWithRelationInput[];
    includeChildren?: boolean;
    includeParent?: boolean;
  }): Promise<BusinessCategory[]> {
    const {
      skip,
      take,
      where,
      orderBy,
      includeChildren = false,
      includeParent = true,
    } = params;

    return this.prisma.businessCategory.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        parent: includeParent,
        children: includeChildren,
      },
    });
  }

  /**
   * Đếm số lượng theo điều kiện
   */
  async count(where?: Prisma.BusinessCategoryWhereInput): Promise<number> {
    return this.prisma.businessCategory.count({ where });
  }

  /**
   * Cập nhật business category
   */
  async update(
    id: string,
    data: Prisma.BusinessCategoryUpdateInput,
  ): Promise<BusinessCategory> {
    return this.prisma.businessCategory.update({
      where: { id },
      data,
      include: {
        parent: true,
      },
    });
  }

  /**
   * Xóa business category
   */
  async delete(id: string): Promise<BusinessCategory> {
    return this.prisma.businessCategory.delete({
      where: { id },
    });
  }

  /**
   * Lấy tất cả children của một category (recursive)
   */
  async findAllChildren(parentId: string): Promise<BusinessCategory[]> {
    return this.prisma.businessCategory.findMany({
      where: {
        parentId: parentId,
      },
      include: {
        children: true,
      },
    });
  }

  /**
   * Lấy tree structure từ root
   */
  async findTree(rootLevel: number = 1): Promise<BusinessCategory[]> {
    return this.prisma.businessCategory.findMany({
      where: {
        level: rootLevel,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });
  }

  /**
   * Kiểm tra xem category có children không
   */
  async hasChildren(id: string): Promise<boolean> {
    const count = await this.prisma.businessCategory.count({
      where: {
        parentId: id,
      },
    });
    return count > 0;
  }

  /**
   * Tìm theo code
   */
  async findByCode(code: string): Promise<BusinessCategory | null> {
    return this.prisma.businessCategory.findFirst({
      where: { code },
      include: {
        parent: true,
      },
    });
  }

  /**
   * Kiểm tra xem category có đang được sử dụng bởi member không
   */
  async isUsedByMembers(id: string): Promise<boolean> {
    const count = await this.prisma.memberEnterpriseBusinessCategory.count({
      where: {
        businessCategoryId: id,
      },
    });
    return count > 0;
  }
}

