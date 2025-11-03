-- =====================================================
-- SEED: Branch Categories (Chi nhánh VCCI)
-- Mô tả: Danh sách các chi nhánh VCCI hoạt động
-- Sử dụng ON CONFLICT DO NOTHING để an toàn khi chạy nhiều lần
-- =====================================================

INSERT INTO branch_categories (id, name, address, "isActive")
VALUES
  ('brc_1', 'VCCI -Chi nhánh khu vực TP. Hồ Chí Minh', NULL, true),
  ('brc_2', 'VCCI - Chi nhánh Đồng Bằng Sông Cửu Long', NULL, true),
  ('brc_3', 'VCCI - Chi nhánh Duyên hải Bắc bộ', NULL, true),
  ('brc_4', 'VCCI - Chi nhánh Miền Trung - Tây Nguyên', NULL, true),
  ('brc_5', 'VCCI - Chi nhánh Nghệ An - Hà Tĩnh - Quảng Bình', NULL, true),
  ('brc_6', 'VCCI - Chi nhánh Thanh Hóa - Ninh Nình', NULL, true),
  ('brc_7', 'VCCI Trụ sở chính', NULL, true)
ON CONFLICT (id) DO NOTHING;


