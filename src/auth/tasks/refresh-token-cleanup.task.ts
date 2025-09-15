import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class RefreshTokenCleanupTask {
  private readonly logger = new Logger(RefreshTokenCleanupTask.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredTokenCleanup() {
    this.logger.log('Starting expired refresh token cleanup...');
    
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired refresh tokens', error);
    }
  }
}
