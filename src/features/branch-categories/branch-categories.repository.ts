import { Injectable } from '@nestjs/common';
import { Prisma, BranchCategory } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateBranchCategoryDto, QueryBranchCategoryDto, UpdateBranchCategoryDto } from './dto';

@Injectable()
export class BranchCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBranchCategoryDto): Promise<BranchCategory> {
    return this.prisma.branchCategory.create({ data });
  }

  async findAll(query: QueryBranchCategoryDto) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const skip = (page - 1) * limit;

    const where: Prisma.BranchCategoryWhereInput = {
      AND: [
        query.search
          ? {
              name: { contains: query.search, mode: 'insensitive' },
            }
          : {},
        typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {},
      ],
    };

    const orderByField = query.sortBy ?? 'name';
    const sortOrder: Prisma.SortOrder = (query.sortOrder === 'desc' ? 'desc' : 'asc');

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branchCategory.findMany({
        where,
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.branchCategory.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<BranchCategory | null> {
    return this.prisma.branchCategory.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<BranchCategory | null> {
    return this.prisma.branchCategory.findFirst({ where: { name } });
  }

  async findActive(search?: string): Promise<BranchCategory[]> {
    return this.prisma.branchCategory.findMany({
      where: {
        isActive: true,
        name: search
          ? { contains: search, mode: 'insensitive' }
          : undefined,
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: UpdateBranchCategoryDto): Promise<BranchCategory> {
    return this.prisma.branchCategory.update({ where: { id }, data });
  }

  async remove(id: string): Promise<BranchCategory> {
    return this.prisma.branchCategory.delete({ where: { id } });
  }
}


