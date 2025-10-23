-- ===================================================================
-- SEED: Organization Types (Loại hình tổ chức)
-- ===================================================================
-- Mô tả: Danh mục các loại hình tổ chức cho hội viên VCCI
-- Sử dụng ON CONFLICT DO NOTHING để có thể chạy nhiều lần an toàn
-- ===================================================================

INSERT INTO categories (id, name, "nameEn", code, "parentId", type, description, "isActive", "orderIndex", deleted, "createdBy", "createdAt", "updatedAt")
VALUES
  -- 1. Tư nhân (Private)
  (
    'clz_org_type_001',
    'Tư nhân',
    'Private',
    'PRIVATE',
    NULL,
    'ORGANIZATION_TYPE',
    'Doanh nghiệp tư nhân',
    true,
    1,
    false,
    NULL,
    NOW(),
    NOW()
  ),
  
  -- 2. Cổ phần (Share holding)
  (
    'clz_org_type_002',
    'Cổ phần',
    'Share holding',
    'SHARE_HOLDING',
    NULL,
    'ORGANIZATION_TYPE',
    'Công ty cổ phần',
    true,
    2,
    false,
    NULL,
    NOW(),
    NOW()
  ),
  
  -- 3. Hợp tác xã (Cooperatives)
  (
    'clz_org_type_003',
    'Hợp tác xã',
    'Cooperatives',
    'COOPERATIVES',
    NULL,
    'ORGANIZATION_TYPE',
    'Hợp tác xã',
    true,
    3,
    false,
    NULL,
    NOW(),
    NOW()
  ),
  
  -- 4. Trách nhiệm hữu hạn (Limited liability)
  (
    'clz_org_type_004',
    'Trách nhiệm hữu hạn',
    'Limited liability',
    'LIMITED_LIABILITY',
    NULL,
    'ORGANIZATION_TYPE',
    'Công ty TNHH',
    true,
    4,
    false,
    NULL,
    NOW(),
    NOW()
  ),
  
  -- 5. Liên doanh (Joint venture)
  (
    'clz_org_type_005',
    'Liên doanh',
    'Joint venture',
    'JOINT_VENTURE',
    NULL,
    'ORGANIZATION_TYPE',
    'Công ty liên doanh',
    true,
    5,
    false,
    NULL,
    NOW(),
    NOW()
  ),
  
  -- 6. Nhà nước (State owned)
  (
    'clz_org_type_006',
    'Nhà nước',
    'State owned',
    'STATE_OWNED',
    NULL,
    'ORGANIZATION_TYPE',
    'Doanh nghiệp nhà nước',
    true,
    6,
    false,
    NULL,
    NOW(),
    NOW()
  ),
  
  -- 7. Loại khác (Others)
  (
    'clz_org_type_007',
    'Loại khác',
    'Others',
    'OTHERS',
    NULL,
    'ORGANIZATION_TYPE',
    'Loại hình tổ chức khác',
    true,
    7,
    false,
    NULL,
    NOW(),
    NOW()
  )

ON CONFLICT (type, code) DO NOTHING;

-- ===================================================================
-- Kết quả mong đợi: 7 organization types được insert
-- Có thể chạy nhiều lần mà không gây lỗi duplicate
-- ===================================================================

