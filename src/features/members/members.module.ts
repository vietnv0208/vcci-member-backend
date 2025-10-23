import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MembersPublicController } from './members-public.controller';
import { MembersRepository } from './members.repository';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [MembersController, MembersPublicController],
  providers: [MembersService, MembersRepository, PrismaService],
  exports: [MembersService, MembersRepository],
})
export class MembersModule {}
