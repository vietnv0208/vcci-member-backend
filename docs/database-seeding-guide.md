# 🌱 Database Seeding Guide - VCCI Member Backend

## 📖 Tổng quan

Database Seeder là một module cho phép bạn seed dữ liệu mặc định vào database một cách an toàn và có thể lặp lại.

## 🎯 Đã seed data gì?

### 1. Organization Types (Loại hình tổ chức) ✅

File: `prisma/seeds/20250115_organization_types.sql`

7 loại hình tổ chức cho hội viên VCCI:

| Code | Vietnamese | English |
|------|------------|---------|
| `PRIVATE` | Tư nhân | Private |
| `SHARE_HOLDING` | Cổ phần | Share holding |
| `COOPERATIVES` | Hợp tác xã | Cooperatives |
| `LIMITED_LIABILITY` | Trách nhiệm hữu hạn | Limited liability |
| `JOINT_VENTURE` | Liên doanh | Joint venture |
| `STATE_OWNED` | Nhà nước | State owned |
| `OTHERS` | Loại khác | Others |

## 🚀 Cách chạy Seeds

### Phương pháp 1: Qua API (Recommended)

#### Bước 1: Khởi động server

```bash
npm run start:dev
```

#### Bước 2: Đăng nhập và lấy JWT token

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "super_admin@vcci.com",
  "password": "your_password"
}
```

Lưu lại `accessToken` từ response.

#### Bước 3: Chạy seeds

```bash
POST http://localhost:3000/api/database-seeder/seeds
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Hoàn thành seeds thành công! Đã chạy 1 seeds trong 125ms\n📊 Trạng thái sau seeding:\n- Organization types: 7",
  "seedsExecuted": [
    "20250115_organization_types.sql"
  ],
  "errors": [],
  "executionTime": 125
}
```

#### Bước 4: Kiểm tra kết quả

```bash
GET http://localhost:3000/api/database-seeder/seeds/status
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "organizationTypesCount": 7
}
```

### Phương pháp 2: Qua Prisma Studio (Manual)

```bash
# Mở Prisma Studio
npx prisma studio

# Copy nội dung SQL từ prisma/seeds/20250115_organization_types.sql
# Paste vào PostgreSQL client và execute
```

### Phương pháp 3: Qua SQL Client trực tiếp

```bash
# Kết nối tới PostgreSQL
psql -h localhost -U postgres -d vcci_member_db

# Copy và chạy SQL từ file seed
\i prisma/seeds/20250115_organization_types.sql
```

## 🔍 Verify Seeds

### Kiểm tra qua API

```bash
GET http://localhost:3000/api/categories?type=ORGANIZATION_TYPE
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Kiểm tra qua Prisma Studio

```bash
npx prisma studio

# Mở model Category
# Filter: type = "ORGANIZATION_TYPE"
# Kết quả mong đợi: 7 records
```

### Kiểm tra qua SQL

```sql
SELECT * FROM categories 
WHERE type = 'ORGANIZATION_TYPE' 
AND deleted = false;
```

## 📋 Sử dụng trong Member Registration

Sau khi seed, bạn có thể sử dụng organization types khi tạo member:

```typescript
// Example: Tạo member với organization type
const member = await prisma.memberEnterpriseDetail.create({
  data: {
    organizationTypes: ['SHARE_HOLDING', 'LIMITED_LIABILITY'],
    // ... other fields
  }
});
```

hoặc qua API:

```bash
POST http://localhost:3000/api/members
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "applicationType": "ENTERPRISE",
  "enterpriseDetail": {
    "organizationTypes": ["SHARE_HOLDING"]
  }
}
```

## 🧪 Testing

Chạy unit tests:

```bash
npm test -- database-seeder.spec.ts
```

Kết quả mong đợi:
```
PASS src/features/database-seeder/database-seeder.spec.ts
  DatabaseSeederService
    ✓ should be defined
    ✓ should check seed status
    runAllSeeds
      ✓ should find seed files in prisma/seeds directory
    safeDeploymentSeed
      ✓ should run deployment seed and check status

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

## 🔐 Permissions

| Endpoint | Required Role |
|----------|---------------|
| `POST /database-seeder/seeds` | `SUPER_ADMIN` |
| `GET /database-seeder/seeds/status` | `SUPER_ADMIN`, `ADMIN` |

## 🚨 Troubleshooting

### Error: "Failed to run database seeds: Seed file không tồn tại"

**Nguyên nhân:** Thư mục `prisma/seeds/` không tồn tại hoặc không có file `.sql`

**Giải pháp:**
```bash
# Tạo thư mục seeds
mkdir -p prisma/seeds

# Verify file tồn tại
ls prisma/seeds/
```

### Error: "duplicate key value violates unique constraint"

**Nguyên nhân:** Seeds đã được chạy trước đó và không có `ON CONFLICT DO NOTHING`

**Giải pháp:** File seed đã có `ON CONFLICT DO NOTHING`, bạn có thể chạy lại an toàn.

### Error: "403 Forbidden"

**Nguyên nhân:** User không có quyền `SUPER_ADMIN`

**Giải pháp:**
```sql
-- Update user role trong database
UPDATE users 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your_email@vcci.com';
```

### Seeds chạy chậm

**Giải pháp:**
- Kiểm tra database connection
- Kiểm tra indexes trên table `categories`
- Review SQL query trong seed file

## 📦 Deployment

### Development

```bash
npm run start:dev
# Chạy seeds qua API endpoint
```

### Production

```bash
# Build
npm run build

# Start production
npm run start:prod

# Chạy seeds qua API hoặc migration script
```

### CI/CD

Thêm vào pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Run Database Seeds
  run: |
    curl -X POST ${{ secrets.API_URL }}/api/database-seeder/seeds \
      -H "Authorization: Bearer ${{ secrets.SUPER_ADMIN_TOKEN }}" \
      -H "Content-Type: application/json"
```

## 📚 Tài liệu liên quan

- [Database Schema](../prisma/schema.prisma)
- [Category Feature](../src/features/common/category/README.md)
- [Member Feature](../src/features/members/README.md)
- [AGENTS.md](../AGENTS.md)

## 🎓 Best Practices

1. ✅ Luôn test seeds locally trước
2. ✅ Sử dụng `ON CONFLICT DO NOTHING` để idempotent
3. ✅ Đặt tên file theo format `YYYYMMDD_description.sql`
4. ✅ Sử dụng fixed IDs để dễ reference
5. ✅ Log và monitor seed execution
6. ✅ Backup database trước khi chạy seeds trên production

---

✨ **Happy Seeding!** ✨

