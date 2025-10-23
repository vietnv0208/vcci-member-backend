# 🏢 Members Module - VCCI Member Management

Module quản lý hội viên VCCI với đầy đủ tính năng CRUD, xét duyệt và quản lý trạng thái.

## 📋 Tính năng

### ✅ Đã hoàn thành

- ✅ **CRUD Operations**: Tạo, đọc, cập nhật, xóa hội viên
- ✅ **Public Member Registration**: API công khai cho đăng ký hội viên (không cần authentication)
- ✅ **Member Registration**: Đăng ký hội viên mới (Doanh nghiệp & Hiệp hội)
- ✅ **Status Management**: Quản lý trạng thái hội viên với workflow
- ✅ **Search & Filter**: Tìm kiếm và lọc hội viên theo nhiều tiêu chí
- ✅ **Pagination**: Phân trang danh sách hội viên
- ✅ **Statistics**: Thống kê tổng quan về hội viên
- ✅ **Member Code Generation**: Tự động sinh mã hội viên (VCCI{YEAR}{NUMBER})
- ✅ **Status History**: Lưu lịch sử thay đổi trạng thái
- ✅ **Business Categories Management**: Quản lý ngành nghề kinh doanh với cấu trúc phân cấp
- ✅ **Business Categories in Response**: Trả về thông tin đầy đủ của business categories trong member response
- ✅ **Hierarchical Category Search**: Tìm kiếm theo category cha sẽ tự động bao gồm tất cả category con
- ✅ **Contact Management**: Quản lý người liên hệ/lãnh đạo
- ✅ **Role-based Access Control**: Phân quyền theo vai trò

## 🏗️ Kiến trúc

```
src/features/members/
├── dto/                                  # Data Transfer Objects
│   ├── create-member.dto.ts             # DTO tạo hội viên mới
│   ├── update-member.dto.ts             # DTO cập nhật hội viên
│   ├── query-member.dto.ts              # DTO query/filter
│   ├── member-response.dto.ts           # DTO response
│   ├── change-member-status.dto.ts      # DTO thay đổi trạng thái
│   └── index.ts
├── members.controller.ts                 # REST API endpoints (Protected)
├── members-public.controller.ts          # Public API endpoints (No Auth)
├── members.service.ts                    # Business logic
├── members.repository.ts                 # Data access layer
├── members.module.ts                     # NestJS module
├── index.ts                              # Exports
└── README.md                             # Documentation
```

## 🔌 API Endpoints

### 🌐 Public API (Không cần Authentication)

#### 1. Đăng ký hội viên (Public)
```http
POST /api/public/members/register
Content-Type: application/json
```

**Mô tả:** API công khai cho phép doanh nghiệp/hiệp hội tự đăng ký làm hội viên VCCI mà không cần đăng nhập. Đơn đăng ký sẽ tự động có trạng thái `PENDING` và chờ admin xét duyệt.

**Request Body:** (Giống như endpoint tạo member bên dưới)

**Response:**
```json
{
  "id": "cm...",
  "code": "VCCI20250001",
  "status": "PENDING",
  "vietnameseName": "Công ty TNHH ABC",
  "email": "contact@abc.com",
  "telephone": "024-1234567",
  "officeAddress": "123 Đường ABC",
  "enterpriseDetail": { ... },
  "contacts": [ ... ],
  "businessCategories": [
    {
      "id": "cat_001",
      "code": "A",
      "name": "Nông nghiệp, lâm nghiệp và thuỷ sản",
      "level": 1,
      "parentId": null,
      "isActive": true
    },
    {
      "id": "cat_002",
      "code": "01",
      "name": "Trồng trọt và chăn nuôi",
      "level": 2,
      "parentId": "cat_001",
      "isActive": true
    }
  ],
  "createdAt": "2025-01-15T...",
  "updatedAt": "2025-01-15T..."
}
```

---

### 🔒 Protected API (Yêu cầu Authentication)

#### 1. Tạo đơn đăng ký hội viên mới (Admin)
```http
POST /api/members
Authorization: Bearer {token}
Roles: SUPER_ADMIN, ADMIN, MANAGEMENT
```

**Request Body:**
```json
{
  "applicationType": "ENTERPRISE",
  "memberType": "LINKED",
  "vietnameseName": "Công ty TNHH ABC",
  "englishName": "ABC Company Limited",
  "abbreviation": "ABC Co.",
  "officeAddress": "123 Đường ABC, Hà Nội",
  "businessAddress": "456 Đường XYZ, Hà Nội",
  "telephone": "024-1234567",
  "email": "contact@abc.com",
  "website": "https://abc.com",
  "taxCode": "0123456789",
  "expireDate": "2025-12-31",
  "remarks": "Ghi chú",
  "enterpriseDetail": {
    "businessRegistrationNo": "0123456789",
    "businessRegistrationDate": "2020-01-01",
    "issuedBy": "Sở KH&ĐT Hà Nội",
    "registeredCapital": 10000000000,
    "totalAsset": 50000000000,
    "previousYearRevenue": 100000000000,
    "totalEmployees": 100,
    "branchInfo": "Chi nhánh tại TP.HCM",
    "organizationTypes": ["ORG_TYPE_001"]
  },
  "contacts": [
    {
      "contactRole": "CEO",
      "fullName": "Nguyễn Văn A",
      "gender": "MALE",
      "telephone": "024-1234567",
      "mobile": "0901234567",
      "email": "ceo@abc.com",
      "note": "Giám đốc điều hành"
    }
  ],
  "businessCategoryIds": ["cat_001", "cat_002"],
  "attachmentIds": ["file_001", "file_002"]
}
```

#### 2. Lấy danh sách hội viên
```http
GET /api/members?search=ABC&status=PENDING&page=1&limit=10
Authorization: Bearer {token}
Roles: SUPER_ADMIN, ADMIN, MANAGEMENT
```

**Query Parameters:**
- `search`: Tìm kiếm theo tên, email, mã số thuế
- `applicationType`: ENTERPRISE | ASSOCIATION
- `memberType`: LINKED | OFFICIAL | HONORARY
- `status`: PENDING | APPROVED | REJECTED | CANCELLED | ACTIVE | INACTIVE | SUSPENDED | TERMINATED
- `businessCategoryId`: **Lọc theo ngành nghề kinh doanh** (sẽ tìm cả category con) - VD: nếu chọn "Nông nghiệp" (level 1) sẽ tìm tất cả members có ngành nghề thuộc "Nông nghiệp" và các ngành con như "Trồng trọt", "Chăn nuôi"...
- `submittedDateFrom`: Ngày đăng ký từ (ISO 8601)
- `submittedDateTo`: Ngày đăng ký đến (ISO 8601)
- `approvedDateFrom`: Ngày duyệt từ (ISO 8601)
- `approvedDateTo`: Ngày duyệt đến (ISO 8601)
- `page`: Số trang (default: 1)
- `limit`: Số lượng mỗi trang (default: 10, max: 100)
- `sortBy`: Sắp xếp theo trường (default: createdAt)
- `sortOrder`: asc | desc (default: desc)

#### 3. Lấy thống kê hội viên
```http
GET /api/members/statistics
Authorization: Bearer {token}
Roles: SUPER_ADMIN, ADMIN, MANAGEMENT
```

#### 4. Lấy thông tin chi tiết hội viên
```http
GET /api/members/:id
Authorization: Bearer {token}
Roles: SUPER_ADMIN, ADMIN, MANAGEMENT
```

#### 5. Lấy thông tin hội viên theo mã
```http
GET /api/members/code/:code
Authorization: Bearer {token}
Roles: SUPER_ADMIN, ADMIN, MANAGEMENT
```

#### 6. Cập nhật thông tin hội viên
```http
PATCH /api/members/:id
Authorization: Bearer {token}
Roles: SUPER_ADMIN, ADMIN, MANAGEMENT
```

#### 7. Thay đổi trạng thái hội viên
```http
PATCH /api/members/:id/status
Authorization: Bearer {token}
Roles: SUPER_ADMIN, ADMIN
```

**Request Body:**
```json
{
  "status": "APPROVED",
  "remark": "Đã xét duyệt và chấp nhận"
}
```

#### 8. Xóa hội viên
```http
DELETE /api/members/:id
Authorization: Bearer {token}
Roles: SUPER_ADMIN
```

## 🔄 Member Status Workflow

```
PENDING (Chờ xét duyệt)
  ├─> APPROVED (Được duyệt)
  │     ├─> ACTIVE (Đang hoạt động)
  │     │     ├─> INACTIVE (Không hoạt động)
  │     │     │     ├─> ACTIVE
  │     │     │     └─> TERMINATED (Chấm dứt)
  │     │     └─> SUSPENDED (Tạm ngưng)
  │     │           ├─> ACTIVE
  │     │           └─> TERMINATED
  │     └─> REJECTED (Bị từ chối)
  │           └─> PENDING
  ├─> REJECTED
  │     └─> PENDING
  └─> CANCELLED (Đã hủy)
        └─> PENDING
```

### Quy tắc chuyển trạng thái:

- **PENDING** → APPROVED, REJECTED, CANCELLED
- **APPROVED** → ACTIVE, REJECTED
- **REJECTED** → PENDING
- **CANCELLED** → PENDING
- **ACTIVE** → INACTIVE, SUSPENDED
- **INACTIVE** → ACTIVE, TERMINATED
- **SUSPENDED** → ACTIVE, TERMINATED
- **TERMINATED** → (Không thể chuyển)

## 📊 Database Schema

### Member
- Thông tin cơ bản: tên, địa chỉ, liên hệ
- Mã hội viên tự động: `VCCI{YEAR}{NUMBER}` (VD: VCCI20250001)
- Loại đơn: ENTERPRISE, ASSOCIATION
- Loại hội viên: LINKED, OFFICIAL, HONORARY
- Trạng thái: PENDING, APPROVED, REJECTED, CANCELLED, ACTIVE, INACTIVE, SUSPENDED, TERMINATED

### MemberEnterpriseDetail
- Thông tin doanh nghiệp
- Giấy phép kinh doanh
- Vốn điều lệ, tài sản, doanh thu
- Số lượng nhân viên
- Loại hình tổ chức

### MemberAssociationDetail
- Thông tin hiệp hội
- Giấy phép thành lập
- Số lượng hội viên

### MemberContact
- Người liên hệ/lãnh đạo
- Vai trò: CHAIR_PERSON, CEO, CHIEF_OFFICE, SECRETARY_GENERAL, CONTACT_1, CONTACT_2
- Thông tin liên lạc

### MemberStatusHistory
- Lịch sử thay đổi trạng thái
- Người thực hiện
- Ghi chú

### MemberEnterpriseBusinessCategory
- Liên kết với danh mục ngành nghề

### BusinessCategory (Returned in Response)
Mỗi member sẽ trả về danh sách `businessCategories` với thông tin đầy đủ:
```json
{
  "id": "category_id",
  "code": "A",                    // Mã danh mục theo QĐ 27/2018/QĐ-TTg
  "name": "Nông nghiệp, lâm nghiệp và thuỷ sản",
  "level": 1,                     // Cấp độ: 1 (Section), 2 (Division), 3 (Group), 4 (Class)
  "parentId": null,               // ID danh mục cha (null nếu là root)
  "isActive": true                // Trạng thái hoạt động
}
```

**Cấu trúc phân cấp:**
- **Level 1 (Section)**: A, B, C... (21 sections) - VD: "A - Nông nghiệp, lâm nghiệp và thuỷ sản"
- **Level 2 (Division)**: 01, 02, 03... (88 divisions) - VD: "01 - Trồng trọt và chăn nuôi"
- **Level 3 (Group)**: 011, 012, 013... - VD: "011 - Trồng cây hàng năm"
- **Level 4 (Class)**: 0111, 0112... - VD: "0111 - Trồng lúa"

## 🔐 Phân quyền

| Endpoint | SUPER_ADMIN | ADMIN | MANAGEMENT | MEMBER |
|----------|-------------|-------|------------|--------|
| POST /members | ✅ | ✅ | ✅ | ❌ |
| GET /members | ✅ | ✅ | ✅ | ❌ |
| GET /members/:id | ✅ | ✅ | ✅ | ❌ |
| GET /members/code/:code | ✅ | ✅ | ✅ | ❌ |
| GET /members/statistics | ✅ | ✅ | ✅ | ❌ |
| PATCH /members/:id | ✅ | ✅ | ✅ | ❌ |
| PATCH /members/:id/status | ✅ | ✅ | ❌ | ❌ |
| DELETE /members/:id | ✅ | ❌ | ❌ | ❌ |

## 🧪 Testing

```bash
# Unit tests
npm run test -- members

# E2E tests
npm run test:e2e -- members

# Coverage
npm run test:cov
```

## 📝 Usage Examples

### Tạo hội viên doanh nghiệp
```typescript
const member = await membersService.create({
  applicationType: 'ENTERPRISE',
  vietnameseName: 'Công ty ABC',
  email: 'contact@abc.com',
  telephone: '024-1234567',
  officeAddress: '123 Đường ABC',
  enterpriseDetail: {
    businessRegistrationNo: '0123456789',
    organizationTypes: ['ORG_TYPE_001']
  },
  contacts: [
    {
      contactRole: 'CEO',
      fullName: 'Nguyễn Văn A',
      email: 'ceo@abc.com'
    }
  ]
}, userId);
```

### Tìm kiếm hội viên
```typescript
const result = await membersService.findAll({
  search: 'ABC',
  status: 'ACTIVE',
  applicationType: 'ENTERPRISE',
  page: 1,
  limit: 10
});
```

### Tìm kiếm theo ngành nghề kinh doanh (với category con)
```typescript
// Tìm tất cả members có ngành nghề là "Nông nghiệp" 
// hoặc các ngành con (Trồng trọt, Chăn nuôi, Lâm nghiệp...)
const result = await membersService.findAll({
  businessCategoryId: 'agriculture_category_id', // ID của category "Nông nghiệp"
  page: 1,
  limit: 20
});

// Kết quả sẽ bao gồm:
// - Members có category chính xác là "Nông nghiệp"
// - Members có category là "Trồng trọt" (con của Nông nghiệp)
// - Members có category là "Trồng lúa" (con của Trồng trọt)
// - ... tất cả descendants
```

### Thay đổi trạng thái
```typescript
const member = await membersService.changeStatus(
  memberId,
  {
    status: 'APPROVED',
    remark: 'Đã xét duyệt'
  },
  userId
);
```

## 🚀 Next Steps

- [ ] Implement file attachment management
- [ ] Add email notifications for status changes
- [ ] Add member renewal workflow
- [ ] Add member fee management
- [ ] Add export to Excel/PDF
- [ ] Add bulk import from Excel
- [ ] Add member portal for self-service
- [ ] Add advanced reporting

## 📚 Related Modules

- **Auth Module**: Authentication & Authorization
- **Users Module**: User management
- **Files Module**: File upload/download
- **Categories Module**: Organization types, business categories

---

*Module này được phát triển theo feature-based architecture của VCCI Member Backend.*
