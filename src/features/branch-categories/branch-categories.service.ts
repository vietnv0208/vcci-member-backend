import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BranchCategoriesRepository } from './branch-categories.repository';
import { CreateBranchCategoryDto, QueryBranchCategoryDto, UpdateBranchCategoryDto } from './dto';

@Injectable()
export class BranchCategoriesService {
  constructor(private readonly repository: BranchCategoriesRepository) {}

  async create(dto: CreateBranchCategoryDto) {
    const exists = await this.repository.findByName(dto.name);
    if (exists) {
      throw new ConflictException('Tên chi nhánh đã tồn tại');
    }
    return this.repository.create(dto);
  }

  async findAll(query: QueryBranchCategoryDto) {
    return this.repository.findAll(query);
  }

  async getPublicList(search?: string) {
    return this.repository.findActive(search);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }
    return item;
  }

  async update(id: string, dto: UpdateBranchCategoryDto) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }
    if (dto.name) {
      const byName = await this.repository.findByName(dto.name);
      if (byName && byName.id !== id) {
        throw new ConflictException('Tên chi nhánh đã tồn tại');
      }
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }
    return this.repository.remove(id);
  }
}


