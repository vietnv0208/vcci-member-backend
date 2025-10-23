import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PrismaService } from '../../../common/prisma.service';
import { FilesPublicController } from './files-public.controller';

@Module({
  controllers: [FilesController, FilesPublicController],
  providers: [FilesService, PrismaService],
  exports: [FilesService],
})
export class FilesModule {}
