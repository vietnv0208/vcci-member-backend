# 🌱 Database Seeder Module

Module quản lý database seeds cho VCCI Member Backend.

## 📋 Mục đích

- Seed dữ liệu mặc định cho hệ thống (categories, organization types, etc.)
- Hỗ trợ deployment an toàn với ON CONFLICT DO NOTHING
- Có thể chạy nhiều lần mà không gây lỗi duplicate

## 🗂️ Cấu trúc

```
src/features/database-seeder/
├── database-seeder.controller.ts   # API endpoints
├── database-seeder.service.ts      # Business logic
├── database-seeder.module.ts       # Module definition
└── README.md                        # Documentation

prisma/seeds/
└── 20250115_organization_types.sql # SQL seed files
```

## 🚀 API Endpoints

### 1. Chạy Database Seeds

**POST** `/api/database-seeder/seeds`

Chạy tất cả seed files theo thứ tự.

**Authorization:** Chỉ `SUPER_ADMIN`

**Response:**
```json
{
  "success": true,
  "message": "✅ Hoàn thành seeds thành công!...",
  "seedsExecuted": [
    "20250115_organization_types.sql"
  ],
  "errors": [],
  "executionTime": 125
}
```

### 2. Kiểm tra trạng thái Seeds

**GET** `/api/database-seeder/seeds/status`

Kiểm tra số lượng records đã được seed.

**Authorization:** `SUPER_ADMIN` hoặc `ADMIN`

**Response:**
```json
{
  "organizationTypesCount": 7
}
```

## 📝 Cách tạo Seed File mới

### 1. Tạo file SQL trong `prisma/seeds/`

Đặt tên theo format: `YYYYMMDD_description.sql`

Ví dụ: `20250115_organization_types.sql`

### 2. Sử dụng ON CONFLICT DO NOTHING

```sql
INSERT INTO categories (id, name, "nameEn", code, type, ...)
VALUES
  ('id_001', 'Name', 'English Name', 'CODE', 'TYPE', ...),
  ('id_002', 'Name 2', 'English Name 2', 'CODE2', 'TYPE', ...)
ON CONFLICT (type, code) DO NOTHING;
```

### 3. Chạy seed

Gọi API endpoint `/api/database-seeder/seeds` hoặc:

```bash
# Sử dụng curl
curl -X POST http://localhost:3000/api/database-seeder/seeds \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Seeds hiện tại

### Organization Types (Loại hình tổ chức)

File: `20250115_organization_types.sql`

Danh sách 7 loại hình tổ chức:
1. Tư nhân (Private)
2. Cổ phần (Share holding)
3. Hợp tác xã (Cooperatives)
4. Trách nhiệm hữu hạn (Limited liability)
5. Liên doanh (Joint venture)
6. Nhà nước (State owned)
7. Loại khác (Others)

## ⚡ Best Practices

1. **Luôn sử dụng ON CONFLICT** để tránh lỗi duplicate
2. **Đặt tên file theo thời gian** để seeds chạy theo thứ tự
3. **Sử dụng fixed IDs** (ví dụ: `clz_org_type_001`) để dễ reference
4. **Test seeds locally** trước khi deploy lên production
5. **Log chi tiết** để dễ debug khi có lỗi

## 🔒 Security

- Chỉ `SUPER_ADMIN` được phép chạy seeds
- Seeds được log để audit trail
- Sử dụng `$executeRawUnsafe` với caution (chỉ cho seed files tin cậy)

## 📊 Monitoring

Kiểm tra logs để xem kết quả seeds:

```
🌱 Bắt đầu chạy database seeds...
📋 Tìm thấy 1 seed files: 20250115_organization_types.sql
🔄 Đang chạy seed: 20250115_organization_types.sql
✅ Hoàn thành seed: 20250115_organization_types.sql
✅ Thành công: 20250115_organization_types.sql
```

## 🚨 Troubleshooting

### Lỗi: "Seed file không tồn tại"
- Kiểm tra thư mục `prisma/seeds/` có tồn tại
- Kiểm tra file có extension `.sql`

### Lỗi: "duplicate key value violates unique constraint"
- Thêm `ON CONFLICT DO NOTHING` vào SQL
- Hoặc `ON CONFLICT (column) DO UPDATE SET ...`

### Seeds không chạy
- Kiểm tra permissions (phải là SUPER_ADMIN)
- Kiểm tra JWT token có hợp lệ
- Kiểm tra database connection

## 🔄 CI/CD Integration

Seeds có thể được chạy tự động trong deployment pipeline:

```yaml
# Example GitHub Actions
- name: Run Database Seeds
  run: |
    curl -X POST ${{ secrets.API_URL }}/api/database-seeder/seeds \
      -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}"
```

---

*Module này tuân theo feature-based architecture của VCCI Member Backend.*

