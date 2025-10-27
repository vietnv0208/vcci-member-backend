import { Module } from '@nestjs/common';
import { PaymentHistoryController } from './payment-history.controller';
import { PaymentHistoryService } from './payment-history.service';
import { PaymentHistoryRepository } from './payment-history.repository';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  controllers: [PaymentHistoryController],
  providers: [PaymentHistoryService, PaymentHistoryRepository, PrismaService],
  exports: [PaymentHistoryService, PaymentHistoryRepository],
})
export class PaymentHistoryModule {}
