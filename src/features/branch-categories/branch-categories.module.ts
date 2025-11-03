import { Module } from '@nestjs/common';
import { BranchCategoriesService } from './branch-categories.service';
import { BranchCategoriesController } from './branch-categories.controller';
import { BranchCategoriesPublicController } from './branch-categories-public.controller';
import { BranchCategoriesRepository } from './branch-categories.repository';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [],
  controllers: [BranchCategoriesController, BranchCategoriesPublicController],
  providers: [BranchCategoriesService, BranchCategoriesRepository, PrismaService],
  exports: [BranchCategoriesService, BranchCategoriesRepository],
})
export class BranchCategoriesModule {}


