# Activity Log System

Hệ thống ghi log hoạt động tự động cho VCCI Member Backend.

## 🚀 Tính năng

- **Template-based logging**: Sử dụng template để tạo mô tả động
- **Decorator @ActivityLog**: Ghi log tự động cho API endpoints
- **Manual logging**: Ghi log thủ công trong service
- **Context rendering**: Thay thế placeholder trong template bằng dữ liệu thực
- **Target tracking**: Theo dõi đối tượng được tác động (Member, User, File, etc.)

## 📋 Cách sử dụng

### 1. Sử dụng Decorator @ActivityLog

```typescript
import { ActivityLog, ActivityLogInterceptor } from '../common/activity-log';
import { ActivityActionType, ActivityTargetType } from '../common/activity-log';

@Controller('members')
@UseInterceptors(ActivityLogInterceptor)
export class MembersController {
  @Post()
  @ActivityLog({
    action: ActivityActionType.SUBMIT_APPLICATION,
    targetType: ActivityTargetType.MEMBER,
    targetIdField: 'id',
    contextFields: ['companyName', 'email', 'taxCode'],
  })
  async create(@Body() createMemberDto: CreateMemberDto) {
    // API logic
  }
}
```

### 2. Sử dụng Manual Logging trong Service

```typescript
import { ActivityLogService, ActivityActionType, ActivityTargetType } from '../common/activity-log';

@Injectable()
export class MembersService {
  constructor(private readonly activityLogService: ActivityLogService) {}

  async approveMember(id: string, userId: string) {
    // Business logic...
    
    // Log activity
    await this.activityLogService.logActivity(
      ActivityActionType.APPROVE_APPLICATION,
      {
        memberCode: member.code,
        memberName: member.vietnameseName,
      },
      {
        targetType: ActivityTargetType.MEMBER,
        targetId: id,
        userId,
      },
    );
  }
}
```

### 3. Sử dụng Simple Logging

```typescript
await this.activityLogService.logSimpleActivity(
  ActivityActionType.LOGIN,
  'Đăng nhập hệ thống',
  'User đăng nhập từ IP 192.168.1.1',
  {
    targetType: ActivityTargetType.USER,
    targetId: userId,
    userId,
    ipAddress: '192.168.1.1',
  },
);
```

## 🎯 Activity Types

### Member Actions
- `SUBMIT_APPLICATION`: Nộp hồ sơ gia nhập
- `APPROVE_APPLICATION`: Xét duyệt hồ sơ
- `REJECT_APPLICATION`: Từ chối hồ sơ
- `MEMBER_ACTIVATED`: Kích hoạt hội viên
- `MEMBER_SUSPENDED`: Tạm ngưng hội viên
- `EDIT_BASIC_INFO`: Cập nhật thông tin
- `UPDATE_ATTACHMENT`: Cập nhật tài liệu

### Payment Actions
- `PAY_ANNUAL_FEE`: Thanh toán hội phí năm
- `PAY_MULTI_YEARS`: Thanh toán nhiều năm

### User Actions
- `LOGIN`: Đăng nhập
- `LOGOUT`: Đăng xuất
- `CHANGE_PASSWORD`: Đổi mật khẩu
- `CREATE_USER`: Tạo tài khoản
- `UPDATE_USER`: Cập nhật tài khoản
- `DELETE_USER`: Xóa tài khoản

### File Actions
- `UPLOAD_FILE`: Tải lên tài liệu
- `DELETE_FILE`: Xóa tài liệu

## 🧩 Template System

Hệ thống sử dụng template với placeholder để tạo mô tả động:

```typescript
// Template
"Nộp hồ sơ gia nhập VCCI ngày {date}"

// Context data
{ date: "15/01/2024", memberName: "Công ty ABC" }

// Kết quả
"Nộp hồ sơ gia nhập VCCI ngày 15/01/2024"
```

### Supported Placeholders

- `{memberCode}`: Mã hội viên
- `{memberName}`: Tên hội viên
- `{date}`: Ngày tháng
- `{amount}`: Số tiền
- `{year}`: Năm
- `{reason}`: Lý do
- `{fields}`: Các trường được cập nhật
- `{fileName}`: Tên file
- `{ipAddress}`: Địa chỉ IP

## 📊 API Endpoints

### GET /api/activity-logs
Lấy danh sách hoạt động với các filter:

**Query Parameters:**
- `action`: Loại hành động
- `targetType`: Loại đối tượng
- `targetId`: ID đối tượng
- `userId`: ID người thực hiện
- `startDate`: Ngày bắt đầu
- `endDate`: Ngày kết thúc
- `page`: Số trang
- `limit`: Số lượng mỗi trang

**Response:**
```json
{
  "data": [
    {
      "id": "clx123",
      "action": "SUBMIT_APPLICATION",
      "title": "Nộp hồ sơ gia nhập",
      "description": "Nộp hồ sơ gia nhập VCCI ngày 15/01/2024",
      "targetType": "MEMBER",
      "targetId": "mem_123",
      "userId": "user_456",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user_456",
        "username": "admin",
        "fullName": "Nguyễn Văn A"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🔧 Configuration

### ActivityLogModule Setup

```typescript
import { ActivityLogModule } from './features/common/activity-log/activity-log.module';

@Module({
  imports: [
    // ... other modules
    ActivityLogModule,
  ],
})
export class AppModule {}
```

### Service Injection

```typescript
@Injectable()
export class YourService {
  constructor(
    private readonly activityLogService: ActivityLogService,
  ) {}
}
```

## 🎨 Customization

### Thêm Activity Type mới

1. Thêm vào enum `ActivityActionType`:
```typescript
export enum ActivityActionType {
  // ... existing types
  CUSTOM_ACTION = 'CUSTOM_ACTION',
}
```

2. Thêm template vào `ActivityLogService`:
```typescript
private readonly templates: Record<ActivityActionType, ActivityLogTemplate> = {
  // ... existing templates
  [ActivityActionType.CUSTOM_ACTION]: {
    title: 'Custom Action',
    description: 'Custom action: {customField}',
  },
};
```

### Thêm Target Type mới

1. Thêm vào enum `ActivityTargetType`:
```typescript
export enum ActivityTargetType {
  // ... existing types
  CUSTOM_TARGET = 'CUSTOM_TARGET',
}
```

## 🚨 Lưu ý

- Tất cả error messages phải bằng tiếng Việt
- Sử dụng `@ApiBearerAuth('JWT-auth')` cho protected endpoints
- Activity logs được ghi bất đồng bộ để không ảnh hưởng performance
- Template rendering hỗ trợ nested properties (ví dụ: `{user.name}`)
- Context data được merge từ body, params, và query parameters
