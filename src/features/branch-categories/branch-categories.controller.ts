import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BranchCategoriesService } from './branch-categories.service';
import { CreateBranchCategoryDto, QueryBranchCategoryDto, UpdateBranchCategoryDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, Role, RolesGuard } from '../../auth/rbac';

@ApiTags('Branch Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branch-categories')
export class BranchCategoriesController {
  constructor(private readonly branchCategoriesService: BranchCategoriesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tạo chi nhánh mới' })
  @ApiResponse({ status: 201, description: 'Tạo chi nhánh thành công' })
  create(@Body() createDto: CreateBranchCategoryDto) {
    return this.branchCategoriesService.create(createDto);
  }

  @Get()
  @Roles(Role.MANAGEMENT, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Danh sách chi nhánh (phân trang, lọc)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách chi nhánh thành công' })
  findAll(@Query() query: QueryBranchCategoryDto) {
    return this.branchCategoriesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.MANAGEMENT, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Chi tiết chi nhánh' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết chi nhánh thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  findOne(@Param('id') id: string) {
    return this.branchCategoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cập nhật chi nhánh' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBranchCategoryDto) {
    return this.branchCategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xóa chi nhánh' })
  @ApiResponse({ status: 200, description: 'Xóa chi nhánh thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  remove(@Param('id') id: string) {
    return this.branchCategoriesService.remove(id);
  }
}


