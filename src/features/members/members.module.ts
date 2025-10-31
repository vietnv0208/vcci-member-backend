import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MembersPublicController } from './members-public.controller';
import { MembersRepository } from './members.repository';
import { PrismaService } from '../../common/prisma.service';
import { BusinessCategoriesModule } from '../business-categories/business-categories.module';
import { FilesModule } from '../common/file-management';
import { ActivityLogModule } from '../common/activity-log/activity-log.module';
import { MembersMyController } from './members-my.controller';

@Module({
  imports: [BusinessCategoriesModule,
    FilesModule,
    ActivityLogModule,
  ],
  controllers: [MembersController, MembersPublicController, MembersMyController],
  providers: [MembersService, MembersRepository, PrismaService],
  exports: [MembersService, MembersRepository],
})
export class MembersModule {}
