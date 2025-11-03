import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BranchCategoriesService } from './branch-categories.service';
import { PublicQueryBranchCategoryDto } from './dto/public-query-branch-category.dto';

@ApiTags('Branch Categories (Public)')
@Controller('public/branch-categories')
export class BranchCategoriesPublicController {
  constructor(private readonly branchCategoriesService: BranchCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách chi nhánh đang hoạt động (Public)' })
  @ApiResponse({ status: 200, description: 'Danh sách chi nhánh active' })
  getActive(@Query() query: PublicQueryBranchCategoryDto) {
    return this.branchCategoriesService.getPublicList(query.search);
  }
}


