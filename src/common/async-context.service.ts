import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface AsyncContext {
  userId?: string;
}

/**
 * Service quản lý async context để lưu trữ thông tin request
 * như userId trong suốt request lifecycle
 */
@Injectable()
export class AsyncContextService {
  private asyncLocalStorage = new AsyncLocalStorage<AsyncContext>();

  /**
   * Chạy callback trong context với userId
   */
  run<T>(userId: string | undefined, callback: () => T): T {
    return this.asyncLocalStorage.run({ userId }, callback);
  }

  /**
   * Lấy userId từ context hiện tại
   */
  getUserId(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.userId;
  }

  /**
   * Set userId vào context hiện tại (nếu đã có store)
   */
  setUserId(userId: string): void {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.userId = userId;
    }
  }
}
