# TÀI LIỆU API CHI TIẾT - RESTAURANT MANAGEMENT SYSTEM

Tài liệu đặc tả toàn bộ các endpoints trong hệ thống dựa trên Controller và DTO thực tế.

---

## 1. AUTH & TÀI KHOẢN (AuthController & TaiKhoanController)

### 1.1 AuthController
*   **`POST /api/auth/login`**
    *   **Body:** `{"tenDangNhap": "...", "matKhau": "..."}`
    *   **Response:** `{"maNV": "...", "hoTen": "...", "vaiTro": "ADMIN", "token": "...", "yeuCauDoiMatKhau": false}`
*   **`PUT /api/auth/doi-mat-khau-lan-dau`**
    *   **Body:** `{"maNV": "...", "matKhauMoi": "..."}`
    *   **Response:** `"Đổi mật khẩu thành công!"`

### 1.2 TaiKhoanController
*   **`GET /api/tai-khoan`** (Query `?keyword=...`)
    *   **Response:** `[{"maNV": "...", "tenDangNhap": "...", "matKhau": "...", "hoTenNhanVien": "...", "vaiTro": "ADMIN", "trangThai": 1}]`
*   **`POST /api/tai-khoan`**
    *   **Body:** `{"maNV": "...", "tenDangNhap": "...", "matKhau": "...", "trangThai": 1}`
*   **`PUT /api/tai-khoan/{maNV}`**
    *   **Body:** `{"maNV": "...", "tenDangNhap": "...", "matKhau": "...", "trangThai": 1}`
*   **`PUT /api/tai-khoan/{maNV}/trang-thai`**
*   **`PUT /api/tai-khoan/{maNV}/reset-password`**
    *   **Response:** `{"matKhauMoi": "..."}`

---

## 2. QUẢN LÝ NHÂN VIÊN & DANH MỤC (Admin/Manager)

### 2.1 NhanVienController
*   **`GET /api/nhan-vien`**
    *   **Response:** `[{"maNV": "...", "hoTen": "...", "vaiTro": "PHUC_VU", "soDienThoai": "...", "taiKhoanLienKet": "..."}]`
*   **`POST /api/nhan-vien`**
    *   **Body:** `{"hoTen": "...", "vaiTro": "PHUC_VU", "soDienThoai": "..."}`
*   **`PUT /api/nhan-vien/{maNV}`**
    *   **Body:** `{"hoTen": "...", "vaiTro": "PHUC_VU", "soDienThoai": "..."}`

### 2.2 MonAnController
*   **`GET /api/mon-an`** (Query `?keyword=&loaiMon=&trangThai=`)
    *   **Response:** `[{"maMon": 1, "tenMon": "...", "loaiMon": "...", "donViTinh": "...", "donGia": 100, "trangThai": "Còn món"}]`
*   **`GET /api/mon-an/thong-ke`**
    *   **Response:** `{"tongSoMon": 10, "soMonConPhucVu": 8, "soMonTamNgung": 2, "donGiaTrungBinh": 150000}`
*   **`GET /api/mon-an/{id}`**
*   **`POST /api/mon-an`**
    *   **Body:** `{"tenMon": "...", "loaiMon": "...", "donViTinh": "...", "donGia": 100, "trangThai": "..."}`
*   **`PUT /api/mon-an/{id}`**

### 2.3 BanAnController
*   **`GET /api/ban-an/trong`**
    *   **Response:** `[{"maBan": "...", "nhanHienThi": "Bàn 1 (Trống - 4 chỗ)"}]`
*   **`GET /api/ban-an`**
    *   **Response:** `[{"maBan": "...", "tenBan": "...", "soCho": 4, "trangThai": "..."}]`
*   **`GET /api/ban-an/{id}`**, **`POST /api/ban-an`**, **`PUT /api/ban-an/{id}`**, **`DELETE /api/ban-an/{id}`**
    *   **Body (POST/PUT):** `{"maBan": "...", "tenBan": "...", "soCho": 4}`

### 2.4 KhuyenMaiController
*   **`GET /api/khuyen-mai`**, **`GET /api/khuyen-mai/{id}`**, **`POST /api/khuyen-mai`**, **`PUT /api/khuyen-mai/{id}`**, **`DELETE /api/khuyen-mai/{id}`**
    *   **Body:** `{"maKM": "...", "tenKM": "...", "phanTramGiam": 10, "tienGiamToiDa": 50000, "donGiaToiThieu": 100000, "ngayBatDau": "...", "ngayKetThuc": "..."}`
    *   **Response:** `{"maKM": "...", "tenKM": "...", "tienGiam": 50000, "ngayKetThuc": "...", "trangThai": "..."}`

---

## 3. PHỤC VỤ (PhucVuController)
*   **`GET /api/phuc-vu/ban`**
    *   **Response:** `[{"maBan": "...", "tenBan": "...", "trangThai": "...", "maPhieuHienThi": "..."}]`
*   **`GET /api/phuc-vu/ban/{maBan}`**
    *   **Response:** `{"maBan": "...", "tenBan": "...", "trangThai": "...", "maPhieuGM": 1, "maPhieuHienThi": "...", "danhSachMon": [{"maMon": 1, "tenMon": "...", "soLuong": 1, "donGia": 100, "trangThaiBep": "..."}]}`
*   **`POST /api/phuc-vu/ban/{maBan}/mo-ban?maNV=...`**
*   **`GET /api/phuc-vu/thuc-don`**
    *   **Response:** `[{"maMon": 1, "tenMon": "...", "loaiMon": "...", "donGia": 100}]`
*   **`POST /api/phuc-vu/phieu/{maPhieuGM}/them-mon`**
    *   **Body:** `{"danhSachMon": [{"maMon": 1, "soLuong": 2}]}`
*   **`PUT /api/phuc-vu/phieu/{maPhieuGM}/mon/{maMon}`**
    *   **Body:** `{"soLuongMoi": 3}`
*   **`DELETE /api/phuc-vu/phieu/{maPhieuGM}/mon/{maMon}`**

---

## 4. BẾP (BepController)
*   **`GET /api/bep/danh-sach-order`**
    *   **Response:** `[{"maBan": "...", "maPhieuGM": 1, "maPhieuHienThi": "...", "thoiGian": "...", "trangThai": "...", "viTriDoi": "...", "ghiChu": "...", "danhSachMon": [{"tenMon": "...", "soLuong": 1}]}]`
*   **`POST /api/bep/hoan-tat/{maPhieuGM}`**
*   **`GET /api/bep/thuc-don`**
    *   **Response:** `[{"maMon": 1, "tenMon": "...", "loaiMon": "...", "donViTinh": "...", "conMon": true}]`
*   **`PUT /api/bep/thuc-don/{maMon}/trang-thai`**
    *   **Body:** `{"conMon": false}`

---

## 5. THU NGÂN & ĐẶT BÀN (ThanhToanController, PhieuDatBanController)

### 5.1 ThanhToanController
*   **`GET /api/thanh-toan/ban-dang-phuc-vu`**
    *   **Response:** `[{"maBan": "...", "tenBan": "...", "maPhieuGM": 1, "maPhieuHienThi": "...", "tenKhachHang": "...", "soDienThoai": "...", "trangThai": "..."}]`
*   **`GET /api/thanh-toan/chi-tiet/{maPhieuGM}`**
    *   **Response:** `{"tenBan": "...", "maPhieuHienThi": "...", "tenKhachHang": "...", "trangThai": "...", "danhSachMon": [{"tenMon": "...", "soLuong": 1, "donGia": 100, "thanhTien": 100}], "tienKhuyenMai": 0, "tongTienMon": 100, "thueVAT": 8, "tongThanhToan": 108}`
*   **`POST /api/thanh-toan/ap-dung-khuyen-mai`**
    *   **Body:** `{"maPhieuGM": 1, "maKM": "..."}`
*   **`POST /api/thanh-toan/chot-hoa-don`**
    *   **Body:** `{"maPhieuGM": 1, "maKM": "...", "phuongThuc": "...", "tongTienMon": 100, "tienGiam": 0, "thueVAT": 8, "thanhTien": 108}`

### 5.2 PhieuDatBanController
*   **`GET /api/phieu-dat-ban`**, **`GET /{id}`**, **`POST /api/phieu-dat-ban`**, **`PUT /{id}`**, **`DELETE /{id}`**
    *   **Body:** `{"tenKhachHang": "...", "soDienThoai": "...", "ngayDat": "...", "gioDat": "...", "maBan": "...", "soNguoiLon": 2, "soTreEm": 0, "yeuCau": "..."}`

---

## 6. KHO (KhoController, NhaCungCapController)

### 6.1 KhoController
*   **`GET /api/kho/thong-ke`**
    *   **Response:** `{"tongMatHang": 10, "conHangOnDinh": 5, "sapHetHang": 3, "daHetHang": 2}`
*   **`GET /api/kho/nguyen-vat-lieu`**
    *   **Response:** `[{"maNVL": "...", "tenNVL": "...", "donVi": "...", "soLuongTon": 10, "trangThai": "..."}]`
*   **`POST /api/kho/nguyen-vat-lieu`**, **`PUT /api/kho/nguyen-vat-lieu/{maNVL}`**, **`DELETE /api/kho/nguyen-vat-lieu/{maNVL}`**
    *   **Body:** `{"tenNVL": "...", "donVi": "...", "donGiaToiThieu": 100, "donGiaToiDa": 200, "mucTonKhoToiThieu": 5}`
*   **`GET /api/kho/nha-cung-cap`**, **`POST /api/kho/nha-cung-cap`**
    *   **Body:** `{"tenNCC": "...", "soDienThoai": "...", "diaChi": "...", "nguoiLienHe": "...", "ghiChu": "..."}`
*   **`POST /api/kho/phieu-nhap`**
    *   **Body:** `{"maNCC": "...", "lyDoNhap": "...", "tongTienThanhToan": 1000, "danhSachHang": [{"maNVL": "...", "soLuong": 10, "donGia": 100}]}`
*   **`GET /api/kho/phieu-nhap`**
    *   **Response:** `[{"id": 1, "maPhieu": "...", "ngayNhap": "...", "nhaCungCap": "...", "nguoiLap": "...", "tongTien": 1000}]`
*   **`GET /api/kho/bao-cao`**
    *   **Response:** `{"tongMatHang": 10, "tongNhapToanKho": 1000, "tongTonKhoHienTai": 500, "danhSach": [{"maNVL": "...", "tenNVL": "...", "donVi": "...", "nhapTrongKy": 10, "tonKhoHienTai": 5, "trangThai": "..."}]}`

### 6.2 NhaCungCapController
*   **`GET /api/nha-cung-cap`**, **`GET /{id}`**, **`POST`**, **`PUT /{id}`**
    *   **Response:** `[{"maNCC": "...", "tenNCC": "...", "soDienThoai": "..."}]`

---

## 7. BÁO CÁO (BaoCaoController)
*   **`GET /api/bao-cao/doanh-thu`**
    *   **Response:** `{"tongQuan": {...}, "chiTietDanhSach": [{"tongDoanhThu": 100, "tongHoaDon": 10, "giaTriTrungBinhDon": 10, "thucThuSauThue": 10, "ngayHoatDong": "...", "soLuongDon": 10, "doanhSoBan": 10, "thueVat": 0, "thucThu": 10}]}`
*   **`GET /api/bao-cao/ban-chay`**
    *   **Response:** `{"tongQuan": {...}, "chiTietDanhSach": [{"monBanChayNhat": "...", "tongSoPhanDaBan": 10, "tongDoanhThuMon": 100, "tenMon": "...", "loaiMon": "...", "soLuongBan": 10, "tongTienThuDuoc": 100}]}`
*   **`GET /api/bao-cao/ton-kho`**
    *   **Response:** `{"tongQuan": {...}, "chiTietDanhSach": [{"tongMaHang": 10, "soLuongSapHet": 2, "tongTienNhapTrongKy": 100, "maNVL": "...", "tenNVL": "...", "donVi": "...", "tonHienTai": 10, "nhapTrongKy": 5}]}`
