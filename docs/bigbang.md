# Báo Cáo Thay Đổi Code (Sau commit "Fix bug for reception")

Dưới đây là danh sách chi tiết các thay đổi về mặt source code từ sau lần commit gần nhất (`bcd6e2f Fix bug for reception`) cho đến thời điểm hiện tại:

### 1. Thay đổi cấu trúc Entity `ChiTietGoiMon`
* **Xóa bỏ khóa kép (Composite Key):** Đã xóa class `ChiTietGoiMonId.java` vốn dùng để quản lý khóa kép trước đây.
* **Cập nhật `ChiTietGoiMon.java`:** Đổi thiết kế CSDL, sử dụng khóa chính tự tăng (Surrogate Key) bằng cách thêm trường `private Long id;` với `@GeneratedValue(strategy = GenerationType.IDENTITY)`.

### 2. Cập nhật Backend (Repository, Service, Controller)
* **`ChiTietGoiMonRepository.java`:**
  * Loại bỏ các hàm tìm kiếm bằng khóa kép.
  * Việc thao tác CSDL giờ đây chuyển sang dùng trực tiếp khóa chính `id`.
* **`PhucVuController.java` & `PhucVuService.java` / `PhucVuServiceImpl.java`:**
  * **Thêm món ăn:** Khi khách gọi thêm món đã có trên bàn, hệ thống không còn gộp vào record cũ mà luôn tạo một record `ChiTietGoiMon` mới. Điều này giải quyết dứt điểm lỗi trùng khóa khi thêm món.
  * **Sửa số lượng & Xóa món:** Thay vì nhận 2 tham số `(maPhieuGM, maMon)` qua path variable, nay các API này được đổi sang nhận 1 tham số duy nhất là `id` của chi tiết món ăn.
* **`ChiTietMonPhucVuResponse.java`:**
  * Thêm thuộc tính `id` vào DTO trả về để Frontend có thể lấy định danh chính xác của từng dòng order.
* **`ThanhToanServiceImpl.java`:**
  * **Gộp món trên hóa đơn:** Sửa đổi phương thức `layChiTietThanhToan` sử dụng `LinkedHashMap` để tự động cộng dồn số lượng và thành tiền của những món giống nhau (vì chúng được tách ra nhiều dòng ở bảng `ChiTietGoiMon`).
  * **Fix bug kẹt trạng thái bàn:** Sửa logic ở hàm `chotHoaDon`. Do lỗi của proxy Hibernate, việc gán `ban.setTrangThai("Trống")` thông qua đối tượng lấy gián tiếp từ `phieu.getBanAn()` bị lỗi lưu CSDL. Code đã được đổi sang việc fetch trực tiếp `banAnRepository.findById(...)` trước khi cập nhật, đảm bảo lệnh `UPDATE banan SET trang_thai='Trống'` thực thi thành công.

### 3. Cập nhật cấu hình
* **`application.properties`:**
  * Đổi cấu hình kết nối cơ sở dữ liệu `spring.datasource.url`, `username`, `password` từ server Cloud (Aiven) về Local host của máy bạn (`jdbc:mysql://localhost:3306/nexuscore_db`).

### 4. Cập nhật Frontend
* **`frontend/src/pages/Waiter/Waiter.jsx`:**
  * **Map dữ liệu:** Cập nhật logic map dữ liệu response từ Backend để lưu thêm trường `id` của từng món.
  * **Gọi API Xóa & Sửa:** Sửa đường dẫn API khi phục vụ xóa hoặc cập nhật số lượng món, chuyển từ `/api/phuc-vu/phieu/{orderId}/mon/{maMon}` sang `/api/phuc-vu/chi-tiet-mon/{id}` để đồng bộ với Backend.

### 5. Dữ liệu Test CSDL (Data Dump)
Dưới đây là script khởi tạo dữ liệu để đưa vào CSDL:

```sql
-- Dọn dẹp dữ liệu cũ nếu cần (tùy chọn)
-- Cẩn thận khi chạy lệnh DELETE trên các bảng có ràng buộc khóa ngoại
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE chitietnhapkho;
TRUNCATE TABLE phieunhapkho;
TRUNCATE TABLE hoadon;
TRUNCATE TABLE chitietgoimon;
TRUNCATE TABLE phieugoimon;
TRUNCATE TABLE phieudatban;
TRUNCATE TABLE khuyenmai;
TRUNCATE TABLE nguyenvatlieu;
TRUNCATE TABLE nhacungcap;
TRUNCATE TABLE monan;
TRUNCATE TABLE khachhang;
TRUNCATE TABLE banan;
TRUNCATE TABLE taikhoan;
DELETE FROM nhanvien WHERE manv != 'ADMIN01'; -- Giữ lại admin mặc định nếu muốn
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Bảng nhanvien
-- Schema: manv, ho_ten, so_dien_thoai, vai_tro
INSERT INTO nhanvien (manv, ho_ten, so_dien_thoai, vai_tro) VALUES
('NV01', 'Nguyễn Đầu Bếp', '0911111111', 'Đầu bếp'),
('NV02', 'Trần Phục Vụ', '0922222222', 'Nhân viên phục vụ'),
('NV03', 'Lê Lễ Tân', '0933333333', 'Lễ tân'),
('NV04', 'Phạm Kho', '0944444444', 'Nhân viên kho'),
('NV05', 'Hoàng Quản Lý', '0955555555', 'Người quản lý'),
('NV06', 'Ngô Quản Trị', '0966666666', 'Người quản trị')
ON DUPLICATE KEY UPDATE ho_ten=VALUES(ho_ten);

-- 2. Bảng taikhoan (Mật khẩu '123456' đã được mã hóa BCrypt)
-- Schema: manv, mat_khau, ten_dang_nhap, trang_thai, yeu_cau_doi_mat_khau
INSERT INTO taikhoan (manv, ten_dang_nhap, mat_khau, trang_thai, yeu_cau_doi_mat_khau) VALUES
('NV01', 'daubep123', '$2a$10$8.UnVuG9HLROJOs3v799FeYp00T6q213JpX1P.hBw.hF5v68aH0yq', 1, 0),
('NV02', 'phucvu123', '$2a$10$8.UnVuG9HLROJOs3v799FeYp00T6q213JpX1P.hBw.hF5v68aH0yq', 1, 0),
('NV03', 'letan123', '$2a$10$8.UnVuG9HLROJOs3v799FeYp00T6q213JpX1P.hBw.hF5v68aH0yq', 1, 0),
('NV04', 'nhanvienkho123', '$2a$10$8.UnVuG9HLROJOs3v799FeYp00T6q213JpX1P.hBw.hF5v68aH0yq', 1, 0),
('NV05', 'quanly123', '$2a$10$8.UnVuG9HLROJOs3v799FeYp00T6q213JpX1P.hBw.hF5v68aH0yq', 1, 0),
('NV06', 'admin123', '$2a$10$8.UnVuG9HLROJOs3v799FeYp00T6q213JpX1P.hBw.hF5v68aH0yq', 1, 0)
ON DUPLICATE KEY UPDATE ten_dang_nhap=VALUES(ten_dang_nhap);

-- 3. Bảng banan
-- Schema: ma_ban, so_cho, ten_ban, trang_thai
INSERT INTO banan (ma_ban, ten_ban, so_cho, trang_thai) VALUES
('B01', 'Bàn 01', 4, 'Trống'),
('B02', 'Bàn 02', 2, 'Trống'),
('B03', 'Bàn 03', 8, 'Trống'),
('B04', 'Bàn 04', 4, 'Trống');


-- 5. Bảng khuyenmai
-- Schema: makm, ngay_ket_thuc, tenkm, tien_giam
INSERT INTO khuyenmai (makm, tenkm, tien_giam, ngay_ket_thuc) VALUES
('KM01', 'Khuyến mãi khai trương', 50000, '2027-12-31'),
('KM02', 'Giảm giá cuối tuần', 20000, '2027-12-31'),
('KM03', 'Tri ân khách hàng', 30000, '2027-12-31');

-- 6. Bảng monan (ma_mon là AUTO_INCREMENT)
-- Schema: ma_mon, don_gia, don_vi_tinh, loai_mon, ten_mon, trang_thai
INSERT INTO monan (ten_mon, loai_mon, don_vi_tinh, don_gia, trang_thai) VALUES
('Lẩu Thái Hà Nội', 'Lẩu & Nướng', 'Nồi', 350000, 'Còn món'),
('Bò Lúc Lắc', 'Món chính', 'Đĩa', 120000, 'Còn món'),
('Salad Dầu Giấm', 'Món khai vị', 'Đĩa', 45000, 'Còn món'),
('Nước Ép Dưa Hấu', 'Thức uống', 'Ly', 35000, 'Còn món'),
('Chè Khúc Bạch', 'Tráng miệng', 'Phần', 25000, 'Còn món');

-- 7. Bảng nhacungcap
-- Schema: mancc, so_dien_thoai, tenncc
INSERT INTO nhacungcap (mancc, tenncc, so_dien_thoai) VALUES
('NCC01', 'Công ty Thực phẩm A', '02811112222'),
('NCC02', 'Vựa rau sạch B', '02833334444'),
('NCC03', 'Hải sản C', '02855556666');

-- 8. Bảng nguyenvatlieu
-- Schema: manvl, don_vi, so_luong_ton, tennvl, trang_thai
INSERT INTO nguyenvatlieu (manvl, tennvl, don_vi, so_luong_ton, trang_thai) VALUES
('NVL01', 'Thịt Bò Mỹ', 'Kg', 50.5, 'Còn hàng'),
('NVL02', 'Rau Salad', 'Kg', 15.0, 'Còn hàng'),
('NVL03', 'Cá Hồi', 'Kg', 20.0, 'Còn hàng');
```
