import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryType,
  CategoryQueryDto,
  CategoryParentRules,
} from './dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async findAll(query?: CategoryQueryDto) {
    if (!query) {
      return this.categoryRepository.findMany({
        deleted: false,
      });
    }

    const { type, search, page = 1, limit = 10 } = query;

    // Build where clause
    const where: any = { deleted: false };

    if (type) {
      where.type = type as any;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get paginated data with total count
    const { data, total } =
      await this.categoryRepository.findManyWithPagination({
        where,
        orderBy: [{ type: 'asc' }, { orderIndex: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findById(id: string) {
    const category = await this.categoryRepository.findFirst({
      id,
      deleted: false,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByType(type: CategoryType) {
    return this.categoryRepository.findMany({
      type: type as any, // Cast to match Prisma enum
      deleted: false,
    });
  }

  async getMapCodeNameByType(type: CategoryType) {
    const categories = await this.findByType(type);

    // Tạo map code -> name cho từng type
    const codeNameMap = new Map<string, string>();
    for (const cat of categories) {
      codeNameMap.set(cat.code, cat.name);
    }
    return codeNameMap;
  }

  async findActiveByType(type: CategoryType) {
    return this.categoryRepository.findMany({
      type: type as any, // Cast to match Prisma enum
      isActive: true,
      deleted: false,
    });
  }

  async validateCategory(type: CategoryType, parentId?: string) {
    const requiredParentType = CategoryParentRules[type];

    if (requiredParentType === null) {
      if (parentId) {
        throw new ConflictException(
          `Danh mục loại "${type}" không được phép có danh mục cha.`,
        );
      }
    } else {
      if (!parentId) {
        throw new ConflictException(
          `Danh mục loại "${type}" bắt buộc phải có danh mục cha thuộc loại "${requiredParentType}".`,
        );
      }
      // check DB: parentId tồn tại và parent.type = requiredParentType
      const parent = await this.categoryRepository.findUnique({
        id: parentId,
      });

      if (!parent) {
        throw new ConflictException(
          `Danh mục cha với ID "${parentId}" không tồn tại.`,
        );
      }

      if (parent.type !== requiredParentType) {
        throw new ConflictException(
          `Danh mục loại "${type}" phải có cha thuộc loại "${requiredParentType}", nhưng tìm thấy "${parent.type}".`,
        );
      }
    }
  }

  async create(data: CreateCategoryDto, createdBy?: string) {
    // Check if name already exists
    await this.validateCategory(data.type, data.parentId);
    const existingByName = await this.categoryRepository.findFirst({
      name: data.name,
      type: data.type,
      deleted: false,
    });

    if (existingByName) {
      throw new ConflictException(
        `Category with name "${data.name}" already exists`,
      );
    }

    // Check if combination of type+code already exists (if code provided)
    if (data.code) {
      const existingByTypeCode = await this.categoryRepository.findFirst({
        type: data.type as any,
        code: data.code,
        deleted: false,
      });

      if (existingByTypeCode) {
        throw new ConflictException(
          `Category with type "${data.type}" and code "${data.code}" already exists`,
        );
      }
    }

    // Validate parent category exists (if provided)
    if (data.parentId) {
      const parentCategory = await this.categoryRepository.findFirst({
        id: data.parentId,
        deleted: false,
      });

      if (!parentCategory) {
        throw new BadRequestException(
          `Parent category with ID ${data.parentId} not found`,
        );
      }
    }

    return this.categoryRepository.create({
      ...data,
      type: data.type as any, // Cast to match Prisma enum
      createdBy,
    });
  }

  async update(id: string, data: UpdateCategoryDto) {
    // Check if category exists
    const existingCategory = await this.findById(id);
    
    // Only validate if type is being updated
    if (data.type) {
      await this.validateCategory(data.type, data.parentId);
    }

    // Check if name already exists (if updating name)
    if (data.name && data.name !== existingCategory.name) {
      const existingByName = await this.categoryRepository.findFirst({
        name: data.name,
        type: data.type || existingCategory.type,
        deleted: false,
        id: { not: id },
      });

      if (existingByName) {
        throw new ConflictException(
          `Category with name "${data.name}" already exists`,
        );
      }
    }

    // Check if combination of type+code already exists (if updating code or type)
    if (
      data.code &&
      (data.code !== existingCategory.code ||
        (data.type && data.type !== existingCategory.type))
    ) {
      const targetType = data.type || existingCategory.type;
      const existingByTypeCode = await this.categoryRepository.findFirst({
        type: targetType as any,
        code: data.code,
        deleted: false,
        id: { not: id },
      });

      if (existingByTypeCode) {
        throw new ConflictException(
          `Category with type "${targetType}" and code "${data.code}" already exists`,
        );
      }
    }

    // Validate parent category exists (if updating parentId)
    if (data.parentId && data.parentId !== existingCategory.parentId) {
      // Prevent circular reference
      if (data.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.categoryRepository.findFirst({
        id: data.parentId,
        deleted: false,
      });

      if (!parentCategory) {
        throw new BadRequestException(
          `Parent category with ID ${data.parentId} not found`,
        );
      }
    }

    return this.categoryRepository.update(
      { id },
      {
        ...data,
        type: data.type ? (data.type as any) : undefined, // Cast to match Prisma enum
      },
    );
  }

  async delete(id: string): Promise<void> {
    // Check if category exists
    await this.findById(id);

    // Check if category has children
    const hasChildren = await this.categoryRepository.findFirst({
      parentId: id,
      deleted: false,
    });

    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete category that has child categories',
      );
    }

    // Soft delete
    await this.categoryRepository.update({ id }, { deleted: true });
  }

  async toggleActive(id: string) {
    const category = await this.findById(id);

    return this.categoryRepository.update(
      { id },
      { isActive: !category.isActive },
    );
  }
}
