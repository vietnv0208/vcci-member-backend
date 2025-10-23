import { Module } from '@nestjs/common';
import { BusinessCategoriesController } from './business-categories.controller';
import { BusinessCategoriesPublicController } from './business-categories-public.controller';
import { BusinessCategoriesService } from './business-categories.service';
import { BusinessCategoriesRepository } from './business-categories.repository';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [
    BusinessCategoriesController,
    BusinessCategoriesPublicController,
  ],
  providers: [
    BusinessCategoriesService,
    BusinessCategoriesRepository,
    PrismaService,
  ],
  exports: [BusinessCategoriesService, BusinessCategoriesRepository],
})
export class BusinessCategoriesModule {}

