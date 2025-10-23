import { Module } from '@nestjs/common';
import { DatabaseSeederController } from './database-seeder.controller';
import { DatabaseSeederService } from './database-seeder.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [DatabaseSeederController],
  providers: [DatabaseSeederService, PrismaService],
  exports: [DatabaseSeederService],
})
export class DatabaseSeederModule {}

