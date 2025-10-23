import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BusinessCategory } from '@prisma/client';
import { BusinessCategoriesRepository } from './business-categories.repository';
import {
  CreateBusinessCategoryDto,
  UpdateBusinessCategoryDto,
  QueryBusinessCategoryDto,
} from './dto';

@Injectable()
export class BusinessCategoriesService {
  constructor(private readonly repository: BusinessCategoriesRepository) {}

  /**
   * Tạo mới business category
   */
  async create(
    createDto: CreateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    const { code, parentId, level, name } = createDto;

    // Validate code uniqueness if provided
    if (code) {
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new ConflictException(
          `Business category với code "${code}" đã tồn tại`,
        );
      }
    }

    // Validate parent exists and level is correct
    if (parentId) {
      const parent = await this.repository.findById(parentId);
      if (!parent) {
        throw new NotFoundException('Danh mục cha không tồn tại');
      }

      // Level should be parent.level + 1
      if (level !== parent.level + 1) {
        throw new BadRequestException(
          `Level phải là ${parent.level + 1} (level của danh mục cha + 1)`,
        );
      }
    } else {
      // No parent, should be level 1
      if (level !== 1) {
        throw new BadRequestException(
          'Danh mục không có parent phải có level = 1',
        );
      }
    }

    return this.repository.create({
      code,
      name,
      level,
      parent: parentId ? { connect: { id: parentId } } : undefined,
    });
  }

  /**
   * Lấy danh sách business categories với phân trang và filter
   */
  async findAll(query: QueryBusinessCategoryDto) {
    const {
      search,
      level,
      parentId,
      includeChildren = false,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (level !== undefined) {
      where.level = level;
    }

    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    const [data, total] = await Promise.all([
      this.repository.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ level: 'asc' }, { code: 'asc' }],
        includeChildren,
        includeParent: true,
      }),
      this.repository.count(where),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết một business category
   */
  async findOne(
    id: string,
    includeChildren: boolean = false,
  ): Promise<BusinessCategory> {
    const category = await this.repository.findById(id, includeChildren, true);

    if (!category) {
      throw new NotFoundException('Không tìm thấy business category');
    }

    return category;
  }

  /**
   * Cập nhật business category
   */
  async update(
    id: string,
    updateDto: UpdateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy business category');
    }

    const { code, parentId, level, name } = updateDto;

    // Validate code uniqueness if changed
    if (code && code !== category.code) {
      const existing = await this.repository.findByCode(code);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Business category với code "${code}" đã tồn tại`,
        );
      }
    }

    // Validate parent change
    if (parentId !== undefined) {
      if (parentId === null) {
        // Removing parent - should be level 1
        if (level !== undefined && level !== 1) {
          throw new BadRequestException(
            'Danh mục không có parent phải có level = 1',
          );
        }
      } else {
        // Changing parent
        if (parentId === id) {
          throw new BadRequestException(
            'Danh mục không thể là parent của chính nó',
          );
        }

        const parent = await this.repository.findById(parentId);
        if (!parent) {
          throw new NotFoundException('Danh mục cha không tồn tại');
        }

        // Check if parentId is a descendant of current category
        if (await this.isDescendant(parentId, id)) {
          throw new BadRequestException(
            'Không thể chọn danh mục con làm parent',
          );
        }

        // Validate level
        const expectedLevel = parent.level + 1;
        if (level !== undefined && level !== expectedLevel) {
          throw new BadRequestException(
            `Level phải là ${expectedLevel} (level của danh mục cha + 1)`,
          );
        }
      }
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (level !== undefined) updateData.level = level;

    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parent = { disconnect: true };
      } else {
        updateData.parent = { connect: { id: parentId } };
      }
    }

    return this.repository.update(id, updateData);
  }

  /**
   * Xóa business category
   */
  async remove(id: string): Promise<{ message: string }> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy business category');
    }

    // Check if has children
    const hasChildren = await this.repository.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestException(
        'Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.',
      );
    }

    // Check if used by members
    const isUsed = await this.repository.isUsedByMembers(id);
    if (isUsed) {
      throw new BadRequestException(
        'Không thể xóa danh mục đang được sử dụng bởi hội viên',
      );
    }

    await this.repository.delete(id);

    return {
      message: 'Xóa business category thành công',
    };
  }

  /**
   * Lấy tree structure
   */
  async getTree(rootLevel: number = 1): Promise<BusinessCategory[]> {
    return this.repository.findTree(rootLevel);
  }

  /**
   * Lấy tất cả children của một category
   */
  async getChildren(id: string): Promise<BusinessCategory[]> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy business category');
    }

    return this.repository.findAllChildren(id);
  }

  /**
   * Kiểm tra xem categoryId có phải là descendant của ancestorId không
   */
  private async isDescendant(
    categoryId: string,
    ancestorId: string,
  ): Promise<boolean> {
    let current = await this.repository.findById(categoryId, false, true);

    while (current && current.parentId) {
      if (current.parentId === ancestorId) {
        return true;
      }
      current = await this.repository.findById(current.parentId, false, true);
    }

    return false;
  }
}
