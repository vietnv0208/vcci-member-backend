import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createLogDeletedExtension } from './middlewares/log-deleted.middleware';
import { AsyncContextService } from './async-context.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private asyncContext?: AsyncContextService;
  private extendedClient: any;

  async onModuleInit(
    @Optional() @Inject(AsyncContextService) asyncContext?: AsyncContextService,
  ) {
    this.asyncContext = asyncContext;
    await this.$connect();

    // Tạo extended client với logging extension
    this.extendedClient = this.$extends(
      createLogDeletedExtension(this, () => this.asyncContext?.getUserId()),
    );
  }

  // Override các method để sử dụng extended client
  get user() {
    return this.extendedClient.user;
  }

  get refreshToken() {
    return this.extendedClient.refreshToken;
  }

  get deletedHistory() {
    return this.extendedClient.deletedHistory;
  }
}
