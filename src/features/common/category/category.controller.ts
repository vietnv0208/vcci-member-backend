import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategorySummaryDto,
  CategoryQueryDto,
  CategoryListResponseDto,
  CategoryType,
  CategoryTypeLabels,
  CategoryParentRules,
} from './dto';
import { UserRole } from '@prisma/client';

@ApiTags('Categories')
@Controller('common/categories')
@ApiBearerAuth('JWT-auth')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories with filtering, searching, and pagination',
    description:
      'Supports filtering by type, searching by code/name, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: CategoryListResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGEMENT)
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Get('active/:type')
  @ApiOperation({
    summary: 'Get active categories by type',
    description:
      'Returns only id, code, and name of active categories sorted by orderIndex and name',
  })
  @ApiParam({
    name: 'type',
    enum: CategoryType,
    description: 'Category type to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'Active categories retrieved successfully',
    type: [CategorySummaryDto],
  })
  async findActiveByType(@Param('type') type: string) {
    // Validate the type parameter
    if (!Object.values(CategoryType).includes(type as CategoryType)) {
      throw new BadRequestException(`Invalid category type: ${type}`);
    }

    return this.categoryService.findActiveByType(type as CategoryType);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get categories by type' })
  @ApiParam({
    name: 'type',
    enum: CategoryType,
    description: 'Category type to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findByType(@Param('type') type: string) {
    // Validate the type parameter
    if (!Object.values(CategoryType).includes(type as CategoryType)) {
      throw new BadRequestException(`Invalid category type: ${type}`);
    }

    return this.categoryService.findByType(type as CategoryType);
  }

  @Get('types')
  @ApiOperation({
    summary: 'Get all category types with labels & parent rules',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of all category types with their display labels and parent rules',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', enum: Object.values(CategoryType) },
          label: { type: 'string' },
          parentType: { type: 'string', nullable: true },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCategoryTypes() {
    return Object.values(CategoryType).map((type) => ({
      value: type,
      label: CategoryTypeLabels[type],
      parentType: CategoryParentRules[type] ?? null,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGEMENT)
  async findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Category name or code already exists',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGEMENT)
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoryService.create(createCategoryDto, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Category name or code already exists',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGEMENT)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with children',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGEMENT)
  async delete(@Param('id') id: string) {
    await this.categoryService.delete(id);
    return { message: 'Category deleted successfully' };
  }

  @Put(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle category active status' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category status toggled successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGEMENT)
  async toggleActive(@Param('id') id: string) {
    return this.categoryService.toggleActive(id);
  }
}
