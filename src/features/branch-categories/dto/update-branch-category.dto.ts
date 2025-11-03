import { PartialType } from '@nestjs/swagger';
import { CreateBranchCategoryDto } from './create-branch-category.dto';

export class UpdateBranchCategoryDto extends PartialType(CreateBranchCategoryDto) {}


