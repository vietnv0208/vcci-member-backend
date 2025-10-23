import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BusinessCategoriesService } from './business-categories.service';
import { PublicQueryBusinessCategoryDto } from './dto/public-query-business-category.dto';

@ApiTags('Business Categories (Public)')
@Controller('public/business-categories')
export class BusinessCategoriesPublicController {
  constructor(
    private readonly businessCategoriesService: BusinessCategoriesService,
  ) {}

  @Get('tree')
  @ApiOperation({
    summary: 'Lấy cây phân cấp business categories (Public, chỉ isActive)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cây phân cấp business categories đang hoạt động',
  })
  getPublicTree(@Query() query: PublicQueryBusinessCategoryDto) {
    return this.businessCategoriesService.getPublicTree(query.search);
  }
}


