-- ===================================================================
-- SEED: Business Categories (Phân loại ngành kinh tế)
-- ===================================================================
-- Mô tả: Phân loại các lĩnh vực ngành kinh tế theo Quyết định 27/2018/QĐ-TTg
-- Cấu trúc phân cấp: 5 cấp (Level 1-5)
-- Sử dụng ON CONFLICT DO NOTHING để có thể chạy nhiều lần an toàn
-- ===================================================================

INSERT INTO business_categories (id, code, name, level, "parentId", "isActive")
VALUES
  -- =====================================================================
  -- LEVEL 1: Các ngành chính (A-U)
  -- =====================================================================
  ('bc_A', 'A', 'NÔNG NGHIỆP, LÂM NGHIỆP VÀ THUỶ SẢN', 1, NULL, true),
  ('bc_B', 'B', 'KHAI KHOÁNG', 1, NULL, true),
  ('bc_C', 'C', 'CÔNG NGHIỆP CHẾ BIẾN, CHẾ TẠO', 1, NULL, true),
  ('bc_D', 'D', 'SẢN XUẤT VÀ PHÂN PHỐI ĐIỆN, KHÍ ĐỐT, NƯỚC NÓNG, HƠI NƯỚC VÀ ĐIỀU HOÀ KHÔNG KHÍ', 1, NULL, true),
  ('bc_E', 'E', 'CUNG CẤP NƯỚC; HOẠT ĐỘNG QUẢN LÝ VÀ XỬ LÝ RÁC THẢI, NƯỚC THẢI', 1, NULL, true),
  ('bc_F', 'F', 'XÂY DỰNG', 1, NULL, true),
  ('bc_G', 'G', 'BÁN BUÔN VÀ BÁN LẺ; SỬA CHỮA Ô TÔ, MÔ TÔ, XE MÁY VÀ XE CÓ ĐỘNG CƠ KHÁC', 1, NULL, true),
  ('bc_H', 'H', 'VẬN TẢI KHO BÃI', 1, NULL, true),
  ('bc_I', 'I', 'DỊCH VỤ LƯU TRÚ VÀ ĂN UỐNG', 1, NULL, true),
  ('bc_J', 'J', 'THÔNG TIN VÀ TRUYỀN THÔNG', 1, NULL, true),
  ('bc_K', 'K', 'HOẠT ĐỘNG TÀI CHÍNH, NGÂN HÀNG VÀ BẢO HIỂM', 1, NULL, true),
  ('bc_L', 'L', 'HOẠT ĐỘNG KINH DOANH BẤT ĐỘNG SẢN', 1, NULL, true),
  ('bc_M', 'M', 'HOẠT ĐỘNG CHUYÊN MÔN, KHOA HỌC VÀ CÔNG NGHỆ', 1, NULL, true),
  ('bc_N', 'N', 'HOẠT ĐỘNG HÀNH CHÍNH VÀ DỊCH VỤ HỖ TRỢ', 1, NULL, true),
  ('bc_O', 'O', 'HOẠT ĐỘNG CỦA ĐẢNG CỘNG SẢN, TỔ CHỨC CHÍNH TRỊ - XÃ HỘI, QUẢN LÝ NHÀ NƯỚC, AN NINH QUỐC PHÒNG; BẢO ĐẢM XÃ HỘI BẮT BUỘC', 1, NULL, true),
  ('bc_P', 'P', 'GIÁO DỤC VÀ ĐÀO TẠO', 1, NULL, true),
  ('bc_Q', 'Q', 'Y TẾ VÀ HOẠT ĐỘNG TRỢ GIÚP XÃ HỘI', 1, NULL, true),
  ('bc_R', 'R', 'NGHỆ THUẬT, VUI CHƠI VÀ GIẢI TRÍ', 1, NULL, true),
  ('bc_S', 'S', 'HOẠT ĐỘNG DỊCH VỤ KHÁC', 1, NULL, true),
  ('bc_T', 'T', 'HOẠT ĐỘNG LÀM THUÊ CÁC CÔNG VIỆC TRONG CÁC HỘ GIA ĐÌNH, SẢN XUẤT SẢN PHẨM VẬT CHẤT VÀ DỊCH VỤ TỰ TIÊU DÙNG CỦA HỘ GIA ĐÌNH', 1, NULL, true),
  ('bc_U', 'U', 'HOẠT ĐỘNG CỦA CÁC TỔ CHỨC VÀ CƠ QUAN QUỐC TẾ', 1, NULL, true),

  -- =====================================================================
  -- LEVEL 2: Các ngành con
  -- =====================================================================
  
  -- A - NÔNG NGHIỆP, LÂM NGHIỆP VÀ THUỶ SẢN
  ('bc_A_01', '1', 'Nông nghiệp và hoạt động dịch vụ có liên quan', 2, 'bc_A', true),
  ('bc_A_02', '2', 'Lâm nghiệp và hoạt động dịch vụ có liên quan', 2, 'bc_A', true),
  ('bc_A_03', '3', 'Khai thác, nuôi trồng thủy sản', 2, 'bc_A', true),

  -- B - KHAI KHOÁNG
  ('bc_B_05', '5', 'Khai thác than cứng và than non', 2, 'bc_B', true),
  ('bc_B_06', '6', 'Khai thác dầu thô và khí đốt tự nhiên', 2, 'bc_B', true),
  ('bc_B_07', '7', 'Khai thác quặng kim loại', 2, 'bc_B', true),
  ('bc_B_08', '8', 'Khai khoáng khác', 2, 'bc_B', true),
  ('bc_B_09', '9', 'Hoạt động dịch vụ hỗ trợ khai khoáng', 2, 'bc_B', true),

  -- C - CÔNG NGHIỆP CHẾ BIẾN, CHẾ TẠO
  ('bc_C_10', '10', 'Sản xuất, chế biến thực phẩm', 2, 'bc_C', true),
  ('bc_C_11', '11', 'Sản xuất đồ uống', 2, 'bc_C', true),
  ('bc_C_12', '12', 'Sản xuất sản phẩm thuốc lá', 2, 'bc_C', true),
  ('bc_C_13', '13', 'Dệt', 2, 'bc_C', true),
  ('bc_C_14', '14', 'Sản xuất trang phục', 2, 'bc_C', true),
  ('bc_C_15', '15', 'Sản xuất da và các sản phẩm có liên quan', 2, 'bc_C', true),
  ('bc_C_16', '16', 'Chế biến gỗ và sản xuất sản phẩm từ gỗ, tre, nứa (trừ giường, tủ, bàn, ghế); sản xuất sản phẩm từ rơm, rạ và vật liệu tết bện', 2, 'bc_C', true),
  ('bc_C_17', '17', 'Sản xuất giấy và sản phẩm từ giấy', 2, 'bc_C', true),
  ('bc_C_18', '18', 'In, sao chép bản ghi các loại', 2, 'bc_C', true),
  ('bc_C_19', '19', 'Sản xuất than cốc, sản phẩm dầu mỏ tinh chế', 2, 'bc_C', true),
  ('bc_C_20', '20', 'Sản xuất hoá chất và sản phẩm hoá chất', 2, 'bc_C', true),
  ('bc_C_21', '21', 'Sản xuất thuốc, hoá dược và dược liệu', 2, 'bc_C', true),
  ('bc_C_22', '22', 'Sản xuất sản phẩm từ cao su và plastic', 2, 'bc_C', true),
  ('bc_C_23', '23', 'Sản xuất sản phẩm từ khoáng phi kim loại khác', 2, 'bc_C', true),
  ('bc_C_24', '24', 'Sản xuất kim loại', 2, 'bc_C', true),
  ('bc_C_25', '25', 'Sản xuất sản phẩm từ kim loại đúc sẵn (trừ máy móc, thiết bị)', 2, 'bc_C', true),
  ('bc_C_26', '26', 'Sản xuất sản phẩm điện tử, máy vi tính và sản phẩm quang học', 2, 'bc_C', true),
  ('bc_C_27', '27', 'Sản xuất thiết bị điện', 2, 'bc_C', true),
  ('bc_C_28', '28', 'Sản xuất máy móc, thiết bị chưa được phân vào đâu', 2, 'bc_C', true),
  ('bc_C_29', '29', 'Sản xuất ô tô và xe có động cơ khác', 2, 'bc_C', true),
  ('bc_C_30', '30', 'Sản xuất phương tiện vận tải khác', 2, 'bc_C', true),
  ('bc_C_31', '31', 'Sản xuất giường, tủ, bàn, ghế', 2, 'bc_C', true),
  ('bc_C_32', '32', 'Công nghiệp chế biến, chế tạo khác', 2, 'bc_C', true),
  ('bc_C_33', '33', 'Sửa chữa, bảo dưỡng và lắp đặt máy móc và thiết bị', 2, 'bc_C', true),

  -- D - SẢN XUẤT VÀ PHÂN PHỐI ĐIỆN
  ('bc_D_35', '35', 'Sản xuất và phân phối điện, khí đốt, nước nóng, hơi nước và điều hoà không khí', 2, 'bc_D', true),

  -- E - CUNG CẤP NƯỚC
  ('bc_E_36', '36', 'Khai thác, xử lý và cung cấp nước', 2, 'bc_E', true),
  ('bc_E_37', '37', 'Thoát nước và xử lý nước thải', 2, 'bc_E', true),
  ('bc_E_38', '38', 'Hoạt động thu gom, xử lý và tiêu hủy rác thải; tái chế phế liệu', 2, 'bc_E', true),
  ('bc_E_39', '39', 'Xử lý ô nhiễm và hoạt động quản lý chất thải khác', 2, 'bc_E', true),

  -- F - XÂY DỰNG
  ('bc_F_41', '41', 'Xây dựng nhà các loại', 2, 'bc_F', true),
  ('bc_F_42', '42', 'Xây dựng công trình kỹ thuật dân dụng', 2, 'bc_F', true),
  ('bc_F_43', '43', 'Hoạt động xây dựng chuyên dụng', 2, 'bc_F', true),

  -- G - BÁN BUÔN VÀ BÁN LẺ
  ('bc_G_45', '45', 'Bán, sửa chữa ô tô, mô tô, xe máy và xe có động cơ khác', 2, 'bc_G', true),
  ('bc_G_46', '46', 'Bán buôn (trừ ô tô, mô tô, xe máy và xe có động cơ khác)', 2, 'bc_G', true),
  ('bc_G_47', '47', 'Bán lẻ (trừ ô tô, mô tô, xe máy và xe có động cơ khác)', 2, 'bc_G', true),

  -- H - VẬN TẢI KHO BÃI
  ('bc_H_49', '49', 'Vận tải đường sắt, đường bộ và vận tải đường ống', 2, 'bc_H', true),
  ('bc_H_50', '50', 'Vận tải đường thủy', 2, 'bc_H', true),
  ('bc_H_51', '51', 'Vận tải hàng không', 2, 'bc_H', true),
  ('bc_H_52', '52', 'Kho bãi và các hoạt động hỗ trợ cho vận tải', 2, 'bc_H', true),
  ('bc_H_53', '53', 'Bưu chính và chuyển phát', 2, 'bc_H', true),

  -- I - DỊCH VỤ LƯU TRÚ VÀ ĂN UỐNG
  ('bc_I_55', '55', 'Dịch vụ lưu trú', 2, 'bc_I', true),
  ('bc_I_56', '56', 'Dịch vụ ăn uống', 2, 'bc_I', true),

  -- J - THÔNG TIN VÀ TRUYỀN THÔNG
  ('bc_J_58', '58', 'Hoạt động xuất bản', 2, 'bc_J', true),
  ('bc_J_59', '59', 'Hoạt động điện ảnh, sản xuất chương trình truyền hình, ghi âm và xuất bản âm nhạc', 2, 'bc_J', true),
  ('bc_J_60', '60', 'Hoạt động phát thanh, truyền hình', 2, 'bc_J', true),
  ('bc_J_61', '61', 'Viễn thông', 2, 'bc_J', true),
  ('bc_J_62', '62', 'Lập trình máy vi tính, dịch vụ tư vấn và các hoạt động khác liên quan đến máy vi tính', 2, 'bc_J', true),
  ('bc_J_63', '63', 'Hoạt động dịch vụ thông tin', 2, 'bc_J', true),

  -- K - HOẠT ĐỘNG TÀI CHÍNH
  ('bc_K_64', '64', 'Hoạt động dịch vụ tài chính (trừ bảo hiểm và bảo hiểm xã hội)', 2, 'bc_K', true),
  ('bc_K_65', '65', 'Bảo hiểm, tái bảo hiểm và bảo hiểm xã hội (trừ bảo đảm xã hội bắt buộc)', 2, 'bc_K', true),
  ('bc_K_66', '66', 'Hoạt động tài chính khác', 2, 'bc_K', true),

  -- L - HOẠT ĐỘNG KINH DOANH BẤT ĐỘNG SẢN
  ('bc_L_68', '68', 'Hoạt động kinh doanh bất động sản', 2, 'bc_L', true),

  -- M - HOẠT ĐỘNG CHUYÊN MÔN
  ('bc_M_69', '69', 'Hoạt động pháp luật, kế toán và kiểm toán', 2, 'bc_M', true),
  ('bc_M_70', '70', 'Hoạt động của trụ sở văn phòng; hoạt động tư vấn quản lý', 2, 'bc_M', true),
  ('bc_M_71', '71', 'Hoạt động kiến trúc; kiểm tra và phân tích kỹ thuật', 2, 'bc_M', true),
  ('bc_M_72', '72', 'Nghiên cứu khoa học và phát triển công nghệ', 2, 'bc_M', true),
  ('bc_M_73', '73', 'Quảng cáo và nghiên cứu thị trường', 2, 'bc_M', true),
  ('bc_M_74', '74', 'Hoạt động chuyên môn, khoa học và công nghệ khác', 2, 'bc_M', true),
  ('bc_M_75', '75', 'Hoạt động thú y', 2, 'bc_M', true),

  -- N - HOẠT ĐỘNG HÀNH CHÍNH
  ('bc_N_77', '77', 'Cho thuê máy móc, thiết bị (không kèm người điều khiển); cho thuê đồ dùng cá nhân và gia đình; cho thuê tài sản vô hình phi tài chính', 2, 'bc_N', true),
  ('bc_N_78', '78', 'Hoạt động dịch vụ lao động và việc làm', 2, 'bc_N', true),
  ('bc_N_79', '79', 'Hoạt động của các đại lý du lịch, kinh doanh tua du lịch và các dịch vụ hỗ trợ, liên quan đến quảng bá và tổ chức tua du lịch', 2, 'bc_N', true),
  ('bc_N_80', '80', 'Hoạt động điều tra bảo đảm an toàn', 2, 'bc_N', true),
  ('bc_N_81', '81', 'Hoạt động dịch vụ vệ sinh nhà cửa, công trình và cảnh quan', 2, 'bc_N', true),
  ('bc_N_82', '82', 'Hoạt động hành chính, hỗ trợ văn phòng và các hoạt động hỗ trợ kinh doanh khác', 2, 'bc_N', true),

  -- O - HOẠT ĐỘNG CỦA ĐẢNG
  ('bc_O_84', '84', 'Hoạt động của Đảng cộng sản, tổ chức chính trị - xã hội, quản lý nhà nước, an ninh quốc phòng, đối ngoại và bảo đảm xã hội bắt buộc', 2, 'bc_O', true),

  -- P - GIÁO DỤC
  ('bc_P_85', '85', 'Giáo dục và đào tạo', 2, 'bc_P', true),

  -- Q - Y TẾ
  ('bc_Q_86', '86', 'Hoạt động y tế', 2, 'bc_Q', true),
  ('bc_Q_87', '87', 'Hoạt động chăm sóc, điều dưỡng tập trung', 2, 'bc_Q', true),
  ('bc_Q_88', '88', 'Hoạt động trợ giúp xã hội không tập trung', 2, 'bc_Q', true),

  -- R - NGHỆ THUẬT
  ('bc_R_90', '90', 'Hoạt động sáng tác, nghệ thuật và giải trí', 2, 'bc_R', true),
  ('bc_R_91', '91', 'Hoạt động của thư viện, lưu trữ, bảo tàng và các hoạt động văn hóa khác', 2, 'bc_R', true),
  ('bc_R_92', '92', 'Hoạt động xổ số, cá cược và đánh bạc', 2, 'bc_R', true),
  ('bc_R_93', '93', 'Hoạt động thể thao, vui chơi và giải trí', 2, 'bc_R', true),

  -- S - HOẠT ĐỘNG DỊCH VỤ KHÁC
  ('bc_S_94', '94', 'Hoạt động của các hiệp hội, tổ chức khác', 2, 'bc_S', true),
  ('bc_S_95', '95', 'Sửa chữa máy vi tính, đồ dùng cá nhân và gia đình', 2, 'bc_S', true),
  ('bc_S_96', '96', 'Hoạt động dịch vụ phục vụ cá nhân khác', 2, 'bc_S', true),

  -- T - HOẠT ĐỘNG LÀM THUÊ
  ('bc_T_97', '97', 'Hoạt động làm thuê công việc gia đình trong các hộ gia đình', 2, 'bc_T', true),
  ('bc_T_98', '98', 'Hoạt động sản xuất sản phẩm vật chất và dịch vụ tự tiêu dùng của hộ gia đình', 2, 'bc_T', true),

  -- U - TỔ CHỨC QUỐC TẾ
  ('bc_U_99', '99', 'Hoạt động của các tổ chức và cơ quan quốc tế', 2, 'bc_U', true),

  -- =====================================================================
  -- LEVEL 3: Các ngành chi tiết
  -- =====================================================================
  
  ('bc_C_17_170', '170', 'Sản xuất giấy và sản phẩm từ giấy', 3, 'bc_C_17', true),
  ('bc_C_24_241', '241', 'Sản xuất sắt, thép, gang', 3, 'bc_C_24', true),
  ('bc_C_29_291', '291', 'Sản xuất ô tô và xe có động cơ khác', 3, 'bc_C_29', true),
  ('bc_C_29_292', '292', 'Sản xuất thân xe ô tô và xe có động cơ khác, rơ moóc và bán rơ moóc', 3, 'bc_C_29', true),
  ('bc_C_29_293', '293', 'Sản xuất phụ tùng và bộ phận phụ trợ cho xe ô tô và xe có động cơ khác', 3, 'bc_C_29', true),
  ('bc_C_31_310', '310', 'Sản xuất giường, tủ, bàn, ghế', 3, 'bc_C_31', true),
  ('bc_T_98_981', '981', 'Hoạt động sản xuất các sản phẩm vật chất tự tiêu dùng của hộ gia đình', 3, 'bc_T_98', true),
  ('bc_T_98_982', '982', 'Hoạt động sản xuất các sản phẩm dịch vụ tự tiêu dùng của hộ gia đình', 3, 'bc_T_98', true),

  -- =====================================================================
  -- LEVEL 4: Các ngành chi tiết cấp 4
  -- =====================================================================
  
  ('bc_C_24_241_2410', '2410', 'Sản xuất sắt, thép, gang', 4, 'bc_C_24_241', true),
  ('bc_C_31_310_3100', '3100', 'Sản xuất giường, tủ, bàn, ghế', 4, 'bc_C_31_310', true),

  -- =====================================================================
  -- LEVEL 5: Các ngành chi tiết cấp 5
  -- =====================================================================
  
  ('bc_C_24_241_2410_24100', '24100', 'Sản xuất sắt, thép, gang', 5, 'bc_C_24_241_2410', true),
  ('bc_C_31_310_3100_31001', '31001', 'Sản xuất giường, tủ, bàn, ghế bằng gỗ', 5, 'bc_C_31_310_3100', true),
  ('bc_C_31_310_3100_31002', '31002', 'Sản xuất giường, tủ, bàn, ghế bằng kim loại', 5, 'bc_C_31_310_3100', true),
  ('bc_C_31_310_3100_31009', '31009', 'Sản xuất giường, tủ, bàn, ghế bằng vật liệu khác', 5, 'bc_C_31_310_3100', true)

ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- Kết quả mong đợi:
-- - Level 1: 21 ngành chính (A-U)
-- - Level 2: 88 ngành con
-- - Level 3: 8 ngành chi tiết
-- - Level 4: 2 ngành chi tiết
-- - Level 5: 4 ngành chi tiết
-- Tổng cộng: 123 business categories
-- Có thể chạy nhiều lần mà không gây lỗi duplicate
-- ===================================================================
