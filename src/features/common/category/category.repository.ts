import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Prisma, Category } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async findMany(where?: Prisma.CategoryWhereInput): Promise<Category[]> {
    return this.prisma.category.findMany({ where });
  }

  async findUnique(where: Prisma.CategoryWhereUniqueInput): Promise<Category | null> {
    return this.prisma.category.findUnique({ where });
  }

  async findFirst(where: Prisma.CategoryWhereInput): Promise<Category | null> {
    return this.prisma.category.findFirst({ where });
  }

  async update(where: Prisma.CategoryWhereUniqueInput, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({ where, data });
  }

  async delete(where: Prisma.CategoryWhereUniqueInput): Promise<Category> {
    return this.prisma.category.delete({ where });
  }

  async count(where?: Prisma.CategoryWhereInput): Promise<number> {
    return this.prisma.category.count({ where });
  }

  async findManyWithPagination(params: {
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  }): Promise<{ data: Category[]; total: number }> {
    const { where, orderBy, skip, take } = params;
    
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data, total };
  }
}
