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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BusinessCategoriesService } from './business-categories.service';
import {
  CreateBusinessCategoryDto,
  UpdateBusinessCategoryDto,
  QueryBusinessCategoryDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('Business Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business-categories')
export class BusinessCategoriesController {
  constructor(
    private readonly businessCategoriesService: BusinessCategoriesService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Tạo mới business category' })
  @ApiResponse({
    status: 201,
    description: 'Business category đã được tạo thành công',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Code đã tồn tại' })
  create(@Body() createDto: CreateBusinessCategoryDto) {
    return this.businessCategoriesService.create(createDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT, Role.MEMBER)
  @ApiOperation({ summary: 'Lấy danh sách business categories với phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách business categories',
  })
  findAll(@Query() query: QueryBusinessCategoryDto) {
    return this.businessCategoriesService.findAll(query);
  }

  @Get('tree')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT, Role.MEMBER)
  @ApiOperation({ summary: 'Lấy cây phân cấp business categories' })
  @ApiQuery({
    name: 'rootLevel',
    required: false,
    description: 'Level gốc của cây (mặc định: 1)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cây phân cấp business categories',
  })
  getTree(@Query('rootLevel') rootLevel?: number) {
    return this.businessCategoriesService.getTree(
      rootLevel ? parseInt(rootLevel.toString()) : 1,
    );
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT, Role.MEMBER)
  @ApiOperation({ summary: 'Lấy chi tiết một business category' })
  @ApiParam({ name: 'id', description: 'ID của business category' })
  @ApiQuery({
    name: 'includeChildren',
    required: false,
    description: 'Bao gồm danh mục con',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết business category',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy business category' })
  findOne(
    @Param('id') id: string,
    @Query('includeChildren') includeChildren?: boolean,
  ) {
    return this.businessCategoriesService.findOne(
      id,
      includeChildren === true || includeChildren === ('true' as any),
    );
  }

  @Get(':id/children')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT, Role.MEMBER)
  @ApiOperation({
    summary: 'Lấy tất cả danh mục con của một business category',
  })
  @ApiParam({ name: 'id', description: 'ID của business category cha' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách danh mục con',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy business category' })
  getChildren(@Param('id') id: string) {
    return this.businessCategoriesService.getChildren(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật business category' })
  @ApiParam({ name: 'id', description: 'ID của business category' })
  @ApiResponse({
    status: 200,
    description: 'Business category đã được cập nhật',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy business category' })
  @ApiResponse({ status: 409, description: 'Code đã tồn tại' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBusinessCategoryDto,
  ) {
    return this.businessCategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa business category' })
  @ApiParam({ name: 'id', description: 'ID của business category' })
  @ApiResponse({
    status: 200,
    description: 'Business category đã được xóa',
  })
  @ApiResponse({
    status: 400,
    description:
      'Không thể xóa danh mục có danh mục con hoặc đang được sử dụng',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy business category' })
  remove(@Param('id') id: string) {
    return this.businessCategoriesService.remove(id);
  }
}
