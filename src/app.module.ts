import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { FilesModule } from './features/common/file-management/files.module';
import { MembersModule } from './features/members/members.module';
import { PaymentHistoryModule } from './features/members/payment-history';
import { BusinessCategoriesModule } from './features/business-categories/business-categories.module';
import { CategoryModule } from './features/common/category/category.module';
import { DatabaseSeederModule } from './features/database-seeder/database-seeder.module';
import { ActivityLogModule } from './features/common/activity-log/activity-log.module';
import { PrismaService } from './common/prisma.service';
import { BranchCategoriesModule } from './features/branch-categories/branch-categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    MembersModule,
    PaymentHistoryModule,
    BusinessCategoriesModule,
    BranchCategoriesModule,
    CategoryModule,
    DatabaseSeederModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService,
  ],
})
export class AppModule {}
