# 🗑️ Log Deleted Middleware - Tự động lưu dữ liệu đã xóa

## 📋 Tổng quan

Middleware này tự động lưu tất cả dữ liệu bị xóa cứng (hard delete) vào bảng `DeletedHistory` để có thể audit hoặc khôi phục sau này.

## 🏗️ Kiến trúc

```
Request → AsyncContextInterceptor → Service → Prisma Client
                 ↓                                    ↓
            Lưu userId                    Prisma Middleware
                                                     ↓
                                          Log Deleted Middleware
                                                     ↓
                                          Lưu vào DeletedHistory
```

### Các thành phần:

1. **AsyncContextService** (`async-context.service.ts`)
   - Quản lý async context sử dụng AsyncLocalStorage
   - Lưu trữ userId trong suốt request lifecycle

2. **AsyncContextInterceptor** (`interceptors/async-context.interceptor.ts`)
   - Intercept mỗi request
   - Lấy userId từ `request.user`
   - Wrap request handler trong async context

3. **Log Deleted Middleware** (`middlewares/log-deleted.middleware.ts`)
   - Prisma middleware bắt các action `delete` và `deleteMany`
   - Lấy dữ liệu trước khi xóa
   - Sau khi xóa thành công, lưu vào `DeletedHistory`

## 🚀 Cách sử dụng

### Tự động (không cần thay đổi code)

Middleware đã được đăng ký globally, mọi hành động xóa sẽ tự động được log:

```typescript
// Service code - không cần thay đổi gì
await this.prisma.user.delete({
  where: { id: userId }
});

// Middleware tự động:
// 1. Lấy dữ liệu user trước khi xóa
// 2. Xóa user
// 3. Lưu dữ liệu đã xóa vào DeletedHistory
```

### Với nhiều records

```typescript
// Xóa nhiều records
await this.prisma.user.deleteMany({
  where: { status: 'INACTIVE' }
});

// Middleware tự động lưu tất cả records bị xóa vào DeletedHistory
```

## 📊 Dữ liệu lưu trong DeletedHistory

```typescript
{
  id: "cuid_xxx",
  table: "User",              // Tên model bị xóa
  objectId: "user_id_123",    // ID của record bị xóa
  data: {                     // Toàn bộ dữ liệu của record (JSON)
    id: "user_id_123",
    email: "user@example.com",
    username: "johndoe",
    // ... tất cả các field khác
  },
  deletedBy: "admin_id_456",  // ID của user thực hiện xóa (nếu có)
  deletedAt: "2024-01-15T10:30:00Z"
}
```

## 🔍 Truy vấn dữ liệu đã xóa

### Xem tất cả records đã xóa của một bảng

```typescript
const deletedUsers = await this.prisma.deletedHistory.findMany({
  where: { table: 'User' },
  orderBy: { deletedAt: 'desc' }
});
```

### Xem ai đã xóa

```typescript
const deletedByUser = await this.prisma.deletedHistory.findMany({
  where: { deletedBy: userId },
  orderBy: { deletedAt: 'desc' }
});
```

### Xem một record cụ thể đã bị xóa

```typescript
const deletedRecord = await this.prisma.deletedHistory.findFirst({
  where: {
    table: 'User',
    objectId: userId
  },
  orderBy: { deletedAt: 'desc' } // Lấy lần xóa gần nhất
});
```

## 🔄 Khôi phục dữ liệu (nếu cần)

```typescript
// Lấy dữ liệu đã xóa
const deleted = await this.prisma.deletedHistory.findUnique({
  where: { id: deletedHistoryId }
});

// Khôi phục (tùy thuộc vào logic nghiệp vụ)
if (deleted.table === 'User') {
  await this.prisma.user.create({
    data: deleted.data as Prisma.UserCreateInput
  });
}
```

## ⚙️ Cấu hình

### Vô hiệu hóa log deleted cho một model cụ thể

Nếu bạn không muốn log deleted cho một model cụ thể, bạn có thể chỉnh sửa middleware:

```typescript
// Trong log-deleted.middleware.ts
const EXCLUDED_MODELS = ['Session', 'Log']; // Models không cần log

if (EXCLUDED_MODELS.includes(model)) {
  return next(params);
}
```

### Thêm metadata khác

Bạn có thể mở rộng để lưu thêm thông tin:

```typescript
await prismaClient.deletedHistory.create({
  data: {
    table: model,
    objectId: record.id ?? 'unknown',
    data: record,
    deletedBy,
    metadata: {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      reason: 'Manual deletion'
    }
  },
});
```

## ⚡ Hiệu năng

- **Overhead**: Rất thấp, chỉ thêm 1-2 queries mỗi lần xóa
- **Storage**: Tăng dần theo số lượng records bị xóa
- **Cleanup**: Nên có job định kỳ xóa các records cũ trong `DeletedHistory`

### Cleanup job (khuyến nghị)

```typescript
// Xóa records cũ hơn 6 tháng
@Cron('0 0 1 * *') // Chạy vào ngày 1 mỗi tháng
async cleanupOldDeletedHistory() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  await this.prisma.deletedHistory.deleteMany({
    where: {
      deletedAt: {
        lt: sixMonthsAgo
      }
    }
  });
}
```

## 🐛 Debug

### Kiểm tra middleware có hoạt động không

Thêm log vào middleware:

```typescript
console.log('[LogDeleted]', {
  action: params.action,
  model: params.model,
  recordsFound: recordsBeforeDelete.length
});
```

### Kiểm tra async context

```typescript
// Trong service
console.log('Current userId:', this.asyncContext.getUserId());
```

## ✅ Lợi ích

| Lợi ích | Mô tả |
|---------|-------|
| ✅ Tự động | Không cần sửa code service |
| ✅ Audit trail | Biết ai xóa gì lúc nào |
| ✅ Khôi phục | Có thể khôi phục dữ liệu |
| ✅ Compliance | Đáp ứng yêu cầu audit |
| ✅ Không ảnh hưởng DB | Không cần sửa schema gốc |

## 🚨 Lưu ý

1. **Unique constraints**: Middleware không ảnh hưởng đến unique constraints vì nó xóa cứng record gốc
2. **Foreign keys**: Cần cẩn thận với cascade deletes
3. **Performance**: Với deleteMany lớn, có thể ảnh hưởng hiệu năng
4. **Storage**: Cần có chiến lược cleanup cho `DeletedHistory`

## 📚 Tham khảo

- [Prisma Middleware](https://www.prisma.io/docs/concepts/components/prisma-client/middleware)
- [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)

