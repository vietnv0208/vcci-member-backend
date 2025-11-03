# 🧩 **AGENTS.md** - VCCI Member Backend

## 🏗️ **Tổng quan kiến trúc**

Dự án **VCCI Member Backend** được phát triển theo **feature-based structure** với NestJS, Prisma và PostgreSQL. Hệ thống quản lý hội viên VCCI với các tính năng đăng ký, xét duyệt và quản lý thành viên.

### **Các layer chính:**
- **Controller** → xử lý request/response, validation
- **Service** → nghiệp vụ (business logic)  
- **Repository** → thao tác dữ liệu (data access layer)
- **PrismaService** → kết nối database và ORM operations
- **DTO / Entity** → chuẩn hóa dữ liệu và validation
- **Auth Module** → xác thực JWT và phân quyền
- **File Management** → quản lý upload/download file
- **Common Module** → tiện ích dùng chung

---

## ⚙️ **Cấu trúc thư mục hiện tại**

```
src/
│
├── main.ts
├── app.module.ts
│
├── auth/                    # 🔐 Authentication & Authorization
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   ├── decorators/
│   ├── enums/
│   ├── interfaces/
│   ├── rbac/
│   └── tasks/
│
├── common/                  # 🛠️ Shared Services
│   └── prisma.service.ts
│
├── features/                # 🎯 Feature Modules
│   ├── users/              # 👥 User Management
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── users.module.ts
│   │
│   ├── database-seeder/    # 🌱 Database Seeder
│   │   ├── database-seeder.controller.ts
│   │   ├── database-seeder.service.ts
│   │   ├── database-seeder.module.ts
│   │   └── database-seeder.spec.ts
│   │
│   └── common/
│       └── file-management/ # 📁 File Management
│           ├── dto/
│           ├── files.controller.ts
│           ├── files.service.ts
│           ├── files.repository.ts
│           └── files.module.ts
│
└── prisma/                  # 🗄️ Database Schema
    ├── schema.prisma
    ├── migrations/
    └── seeds/              # 🌱 Seed Files
        ├── 20250115_organization_types.sql
        └── 20250115_business_categories.sql
```

---

## 🧠 **AGENTS & RESPONSIBILITIES**

### 🔐 **1. Auth Agent**

**Thư mục:** `src/auth/`

**Vai trò:**
- Xác thực JWT và quản lý session
- Phân quyền theo role (SUPER_ADMIN, ADMIN, MANAGEMENT, MEMBER)
- Quản lý refresh token và cleanup tự động

**Nhiệm vụ:**
- `/api/auth/login` - Đăng nhập
- `/api/auth/logout` - Đăng xuất  
- `/api/auth/refresh` - Làm mới token
- `/api/auth/change-password` - Đổi mật khẩu
- Bảo vệ routes qua `@UseGuards(JwtAuthGuard, RolesGuard)`

**Key Components:**
- `JwtStrategy` - Xác thực JWT token
- `LocalStrategy` - Xác thực username/password
- `RefreshTokenCleanupTask` - Cleanup token hết hạn
- `@Roles()` decorator - Phân quyền theo role

---

### 👥 **2. Users Agent**

**Thư mục:** `src/features/users/`

**Vai trò:**
- Quản lý thông tin người dùng hệ thống
- CRUD operations cho users
- Quản lý roles và permissions

**Nhiệm vụ:**
- `/api/users` - CRUD users
- `/api/users/:id` - Chi tiết user
- `/api/users/status` - Thay đổi trạng thái
- `/api/users/reset-password` - Reset mật khẩu
- Pagination và search users

**Key Components:**
- `UsersController` - Xử lý HTTP requests
- `UsersService` - Business logic và validation
- `UsersRepository` - Data access layer
- `CreateUserDto`, `UpdateUserDto` - Validation
- `QueryUserDto` - Search và filter
- Role-based access control

---

### 📁 **3. Files Agent**

**Thư mục:** `src/features/common/file-management/`

**Vai trò:**
- Quản lý upload/download/delete files
- Hỗ trợ cả Local storage và S3
- Quản lý metadata và categories

**Nhiệm vụ:**
- `/api/files/upload` - Upload file
- `/api/files/:id` - Download file
- `/api/files/:id` - Delete file
- `/api/files/folders` - Quản lý thư mục
- `/api/files/attach` - Gắn file vào entity

**Key Components:**
- `FilesController` - Xử lý HTTP requests
- `FilesService` - Business logic và file operations
- `FilesRepository` - Data access cho file metadata
- File type validation (IMAGE, VIDEO, DOCUMENT, PDF, etc.)
- Storage type (LOCAL, S3)
- Entity linking (MEMBER, ARTICLE, etc.)
- File categories (MEMBERSHIP_APPLICATION, BUSINESS_LICENSE, etc.)

---

### 🗄️ **4. Prisma Agent**

**File:** `src/common/prisma.service.ts`

**Vai trò:**
- Kết nối với PostgreSQL qua PrismaClient
- Quản lý database operations
- Cung cấp type-safe database access

**Nhiệm vụ:**
- Database connection management
- Transaction handling
- Error handling cho Prisma operations
- Global database service

---

### 🏛️ **5. Database Schema Agent**

**File:** `prisma/schema.prisma`

**Vai trò:**
- Định nghĩa database schema
- Quản lý relationships giữa các entities
- Migration management

**Key Models:**
- `User` - Người dùng hệ thống
- `RefreshToken` - Token quản lý
- `File` - File management
- `Member` - Hội viên VCCI (sẽ implement)
- `Category` - Danh mục
- `BusinessCategory` - Danh mục ngành nghề

---

### 🌱 **6. Database Seeder Agent**

**Thư mục:** `src/features/database-seeder/`

**Vai trò:**
- Quản lý database seeds cho deployment
- Seed dữ liệu mặc định (categories, organization types, etc.)
- Hỗ trợ idempotent seeding (có thể chạy nhiều lần)

**Nhiệm vụ:**
- `/api/database-seeder/seeds` - Chạy tất cả seeds
- `/api/database-seeder/seeds/status` - Kiểm tra trạng thái seeds
- Safe deployment seeding với ON CONFLICT DO NOTHING
- Seed SQL files từ `prisma/seeds/`

**Key Components:**
- `DatabaseSeederService` - Business logic và file execution
- `DatabaseSeederController` - API endpoints
- SQL seed files - Dữ liệu seed trong `prisma/seeds/`

**Current Seeds:**
- Organization Types (7 loại hình tổ chức) ✅
- Business Categories (123 ngành kinh tế theo QĐ 27/2018/QĐ-TTg) ✅

**Features:**
- Idempotent seeds (có thể chạy nhiều lần an toàn)
- Transaction support
- Error handling và logging
- Role-based access (SUPER_ADMIN only)
- Deployment-ready

---

## 🧭 **Luồng xử lý Request mẫu**

```
[Client] → [Controller] → [Service] → [Repository] → [PrismaService] → [PostgreSQL]
```

**Ví dụ (module `Users`):**

1. Client gửi `POST /api/users` với user data
2. `UsersController.create()` nhận `CreateUserDto`
3. `UsersService.createUser()` xử lý business logic và validation
4. `UsersRepository.create()` thực hiện data access operations
5. `PrismaService.user.create()` lưu vào database
6. Response trả về qua Swagger documentation

---

## 🚀 **Tính năng đang phát triển**

### 🏢 **Members Agent** (Planned)

**Thư mục:** `src/features/members/` (sẽ tạo)

**Vai trò:**
- Quản lý hội viên VCCI
- Xử lý đăng ký và xét duyệt hội viên
- Quản lý thông tin doanh nghiệp/hiệp hội

**Planned Features:**
- `/api/members` - CRUD members
- `/api/members/register` - Đăng ký hội viên
- `/api/members/approve` - Xét duyệt hội viên
- `/api/members/search` - Tìm kiếm hội viên
- Integration với Files Agent cho documents

---

## 🧪 **Testing Strategy**

- **Unit Tests:** Jest cho từng service
- **E2E Tests:** `@nestjs/testing` cho API endpoints
- **Database Tests:** PostgreSQL container với Docker
- **Mock Prisma:** `jest-mock-extended` cho testing

---

## 🧱 **Tech Stack**

| Thành phần | Công nghệ |
|------------|-----------|
| **Backend** | NestJS 11.x |
| **Database** | PostgreSQL + Prisma 6.x |
| **Auth** | JWT + Passport |
| **Validation** | class-validator + class-transformer |
| **Documentation** | Swagger/OpenAPI |
| **File Storage** | Local + S3 (planned) |
| **Testing** | Jest |
| **Container** | Docker + docker-compose |

---

## 🚀 **Scripts Development**

```bash
# Development
npm run start:dev

# Database
npx prisma generate
npx prisma migrate dev --name feature_name
npx prisma studio

# Testing
npm run test
npm run test:e2e
npm run test:cov

# Build & Deploy
npm run build
npm run start:prod
```

---

## 📋 **Development Guidelines**

### **Tạo Feature Module mới:**

1. **Tạo thư mục:** `src/features/{feature-name}/`
2. **Cấu trúc chuẩn:**
   ```
   features/{feature-name}/
   ├── dto/
   ├── {feature}.controller.ts
   ├── {feature}.service.ts
   ├── {feature}.repository.ts
   ├── {feature}.module.ts
   └── index.ts
   ```
3. **Import vào AppModule**
4. **Tạo DTOs với validation**
5. **Implement Repository pattern**
6. **Implement CRUD operations**
7. **Add Swagger documentation**

### **Repository Pattern:**

**Tách biệt Data Access Layer:**
- **Service** → Business logic, validation, orchestration
- **Repository** → Data access operations, query building
- **PrismaService** → Database connection và ORM operations

**Ví dụ Repository:**
```typescript
@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserData) {
    return this.prisma.user.create({ data });
  }

  async findMany(where: Prisma.UserWhereInput) {
    return this.prisma.user.findMany({ where });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### **Database Schema:**
- Sử dụng Prisma migrations
- Định nghĩa relationships rõ ràng
- Sử dụng enums cho status/type
- Soft delete với `deleted` field

### **Authentication:**
- Sử dụng `@UseGuards(JwtAuthGuard, RolesGuard)`
- Phân quyền với `@Roles(Role.ADMIN, Role.SUPER_ADMIN)`
- Validate input với DTOs

### **DTO Input Conversion (class-transformer):**
- **Luôn sử dụng** `@Type(() => Boolean)` cho các trường kiểu boolean (đặc biệt là query params) để chuyển đổi từ string → boolean.
- **Luôn sử dụng** `@Type(() => Number)` cho các trường kiểu số (id, pagination, limit, offset, numeric filters, v.v.) để chuyển đổi từ string → number.
- **Lý do:** `ValidationPipe` nhận dữ liệu từ HTTP dưới dạng string; nếu không chỉ định `@Type`, validation & code-gen có thể lỗi hoặc sai kiểu.
- **Pagination:** `limit` mặc định 20 và tối đa 99999. Luôn ràng buộc với `@Max(99999)` và đặt giá trị mặc định khi không truyền.

Ví dụ cơ bản:
```typescript
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Số bản ghi mỗi trang', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99999)
  @IsOptional()
  limit?: number;
}
```

Ví dụ với mảng giá trị (query như `?ids=1&ids=2` hoặc `?ids=1,2` — cần custom transform nếu dùng CSV):
```typescript
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class IdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => Number(v))
      : String(value)
          .split(',')
          .map((v) => Number(v.trim())),
  )
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];
}
```

### **Error Messages:**
- **Tất cả error messages phải bằng tiếng Việt**
- **Exception types:**
  - `NotFoundException` - Không tìm thấy resource
  - `BadRequestException` - Dữ liệu không hợp lệ
  - `ConflictException` - Xung đột dữ liệu (duplicate, etc.)
  - `UnauthorizedException` - Chưa xác thực
  - `ForbiddenException` - Không có quyền truy cập

**Ví dụ Error Messages:**
```typescript
// ❌ BAD - Tiếng Anh
throw new NotFoundException(`Member with ID ${id} not found`);
throw new BadRequestException('Email already exists');

// ✅ GOOD - Tiếng Việt
throw new NotFoundException(`Không tìm thấy hội viên với ID ${id}`);
throw new ConflictException('Email đã tồn tại trong hệ thống');
```

**Nguyên tắc viết error messages:**
- Rõ ràng, dễ hiểu cho người dùng cuối
- Bao gồm thông tin cụ thể (ID, tên field, giá trị)
- Gợi ý giải pháp nếu có thể
- Nhất quán về cách diễn đạt trong toàn dự án

### **Swagger Documentation:**
- **Luôn sử dụng** `@ApiBearerAuth('JWT-auth')` với parameter
- **Không được** sử dụng `@ApiBearerAuth()` không có parameter
- **Public controllers** (như FilesPublicController) không cần `@ApiBearerAuth`
- **Health check endpoints** (như AppController) không cần authentication

### **Documentation Guidelines:**

**Nguyên tắc tạo documentation:**
- **Không tạo file .md riêng** cho mỗi tính năng thông thường
- **Chỉ tạo documentation** khi tính năng quá phức tạp hoặc đặc biệt
- **Ưu tiên Swagger/OpenAPI** documentation trong code
- **Sử dụng AGENTS.md** làm tài liệu tổng quan duy nhất
- **Comment trong code** thay vì tạo file riêng

**Khi nào cần tạo file .md riêng:**
- Tính năng có **workflow phức tạp** (ví dụ: approval process)
- **Integration** với hệ thống bên ngoài
- **API documentation** cho external partners
- **Deployment guides** hoặc **setup instructions**

**Best practices:**
- Giữ documentation **ngắn gọn** và **focused**
- Cập nhật **AGENTS.md** thay vì tạo file mới
- Sử dụng **code comments** cho implementation details
- **Swagger annotations** cho API documentation

---

## 🔮 **Roadmap**

### **Phase 1: Core Features** ✅
- [x] Authentication & Authorization
- [x] User Management
- [x] File Management
- [x] Database Schema

### **Phase 2: Member Management** 🚧
- [ ] Members CRUD
- [ ] Member Registration
- [ ] Approval Workflow
- [ ] Member Categories

### **Phase 3: Advanced Features** 📋
- [ ] Notification System
- [ ] Report Generation
- [ ] API Rate Limiting
- [ ] Audit Logging

---

*Tài liệu này được cập nhật theo tiến độ phát triển dự án VCCI Member Backend.*
