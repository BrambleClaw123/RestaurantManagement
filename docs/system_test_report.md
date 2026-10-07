# Báo Cáo Kiểm Thử Hệ Thống Quản Lý Nhà Hàng (NexusCore System)

**Người thực hiện:** QA Agent
**Ngày thực hiện:** 28/09/2026

Dưới đây là báo cáo chi tiết về các lỗi, những thành phần chưa tối ưu, thiếu sót và các chức năng hoạt động sai lệch trong mã nguồn hiện hành (cả Frontend và Backend) sau quá trình tổng kiểm tra.

---

## 1. Lỗi Nghiêm Trọng (Critical Bugs - Gây sập tính năng)

### 1.1 Lỗi cập nhật Tài khoản (Admin Module)
- **Tình trạng:** Quản trị viên (Admin) không thể cập nhật thông tin tài khoản (trạng thái hoặc tên đăng nhập). Hệ thống Backend sẽ ném ra lỗi `IllegalArgumentException: rawPassword cannot be null` hoặc lỗi 500.
- **Nguyên nhân:** Tại `TaiKhoanServiceImpl.java`, method `capNhatTaiKhoan` thực hiện đoạn mã: 
  `tkHienTai.setMatKhau(passwordEncoder.encode(request.getMatKhau()));`
  Tuy nhiên, trong quá trình cập nhật ở `Admin.jsx`, Frontend gửi `payload` KHÔNG chứa trường `matKhau` (vì form cập nhật không yêu cầu nhập mật khẩu). Việc gọi `.encode(null)` sẽ khiến thư viện BCrypt văng lỗi ngay lập tức.
- **Khắc phục:** Tại `capNhatTaiKhoan`, cần kiểm tra `if (request.getMatKhau() != null && !request.getMatKhau().isEmpty())` thì mới tiến hành thay đổi mật khẩu.

### 1.2 Lỗi API Client không gửi Query Params (Manager & System-wide)
- **Tình trạng:** Chức năng Lọc thời gian báo cáo ở màn hình Quản Lý (Manager) sẽ không hoạt động hoặc luôn lấy ngày mặc định của Backend, bất kể người dùng chọn ngày nào.
- **Nguyên nhân:** File `src/utils/api.js` định nghĩa hàm get như sau:
  `get: (endpoint) => fetchApi(endpoint, { method: 'GET' })`
  Hàm này chỉ nhận đúng 1 tham số là URL (`endpoint`). Tuy nhiên, tại `Manager.jsx` (Dòng 69), hàm `api.get` được gọi với cú pháp Axios:
  `api.get('/api/bao-cao/doanh-thu', { params: { tuNgay, denNgay } })`
  Tham số thứ 2 bị `api.js` bỏ qua hoàn toàn.
- **Khắc phục:** 
  Cần nối chuỗi trực tiếp ở Frontend: `api.get('/api/bao-cao/doanh-thu?tuNgay=...&denNgay=...')`
  Hoặc thiết kế lại hàm `get` trong `api.js` để tự động parse object `params` thành URL Query String.

### 1.3 Lỗi lệch Data Type giữa FE và BE ở Module Khuyến Mãi (Manager)
- **Tình trạng:** Khi Quản lý Thêm mới hoặc Cập nhật Khuyến Mãi, số tiền giảm giá không được lưu xuống CSDL (Lưu thành giá trị 0 hoặc null).
- **Nguyên nhân:** 
  - Tại Frontend (`Manager.jsx`), lúc tạo payload: `phanTramGiam: Number(promotionForm.tienGiam)` (Dùng field `phanTramGiam`).
  - Tại Backend (`KhuyenMaiRequest.java`), field được định nghĩa là `private Double tienGiam;`.
  Do sai lệch tên trường, Spring Boot không thể binding giá trị giảm giá.
- **Khắc phục:** Đổi tên biến `phanTramGiam` thành `tienGiam` ở `Manager.jsx` khi post API.

---

## 2. Các Lỗi Logic, Nghiệp Vụ (Logical Issues)

### 2.1 Xóa Khuyến Mãi đang được sử dụng
- **Tình trạng:** Khi Manager xóa 1 khuyến mãi đang được đính kèm ở bảng `HoaDon`, Backend đang chặn lại ở Catch: `Khong the xoa do ma khuyen mai nay da duoc su dung`. Tuy nhiên, Frontend hiển thị Toast Error hơi cộc lốc do bắt lỗi trực tiếp từ `e.response.data`.
- **Khuyến nghị:** Cần ẩn khuyến mãi (Cập nhật trạng thái Ngừng Áp Dụng) thay vì xóa cứng (`DELETE`). Entity `KhuyenMai` thiếu cột `TrangThai`.

### 2.2 Thiếu trường 'Mật khẩu' khi nhân viên đổi Pass (Lỗ hổng bảo mật)
- **Tình trạng:** Chưa có giao diện để nhân viên chủ động Đổi mật khẩu cá nhân. Hiện tại nhân viên chỉ có thể nhờ Admin "Reset Mật Khẩu" sinh ra một mã Hash random. Cần có form Đổi mật khẩu yêu cầu nhập Mật khẩu cũ và Mật khẩu mới. (Mặc dù CSDL có cột `yeuCauDoiMatKhau = true/false` nhưng FE chưa xử lý luồng Forced Change Password hoàn chỉnh cho User).

### 2.3 Phân quyền API lỏng lẻo (Security/Authorization)
- **Tình trạng:** Các Controller (ví dụ: `BanAnController`, `PhieuDatBanController`, `ThanhToanController`) hiện tại đang comment-out `@PreAuthorize` hoặc chưa cấu hình phân quyền chặt chẽ dựa vào JWT roles.
- **Rủi ro:** Một tài khoản `Lễ Tân` sử dụng token hợp lệ có thể gọi POST Man API tới nhánh `/api/tai-khoan` (của Admin) để tự tăng quyền hoặc tạo tài khoản.
- **Khắc phục:** Mở khóa các annotaion `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` tương ứng ở Backend.

---

## 3. Các thành phần Dư Thừa & Cần Refactor (Code Smells / Improvements)

### 3.1 Dư thừa Code ở `api.js`
- Đoạn `localStorage.removeItem('nexus_user');` lặp đi lặp lại khi bị lỗi 401. Thực ra, nên cung cấp một hàm chung `logout()` hoặc Context Provider để đẩy người dùng về Login thay vì dùng `window.location.href = '/login';` làm gián đoạn SPA (Single Page Application) của React.

### 3.2 Tối ưu hóa API fetch ở Component
- Tại `Warehouse.jsx`, `Manager.jsx` và `Reception.jsx`, các hàm lấy data được gọi liên tục qua `useEffect([], ...)` không có cơ chế `abortController` (Hủy request). Nếu người dùng chuyển Tab quá nhanh (Từ Booking sang Billing), request cũ vẫn đang chạy sẽ set state lên component đã bị unmount, gây ra cảnh báo `Memory Leak` trên Console.

### 3.3 Thiếu Skeleton / Loading Spinner
- Hệ thống đang dùng trực tiếp mảng rỗng `[]` làm state khởi tạo. Khi API trả về chậm, màn hình sẽ chớp bảng rỗng rồi giật dữ liệu vào, điều này giảm trải nghiệm UX. Nên bổ sung state `isLoading` và render hiệu ứng Loading.

### 3.4 Định dạng ngày giờ UTC (Timezone Issue)
- Backend lưu trữ thời gian bằng `LocalDateTime`. Khi trả về qua API, JSON sẽ ở dạng chuỗi ISO `YYYY-MM-DDTHH:mm:ss`. Ở một số module như Lễ Tân (Reception), FE đang sử dụng chuỗi cắt (`substring(0, 5)`) làm giảm sự chính xác nếu Frontend chạy khác Timezone với Server. Cần sử dụng thư viện xử lý DateTime (ví dụ `date-fns` hoặc `dayjs`) ở FE.

---

**Kết luận:** Hệ thống đã kết nối hoàn chỉnh mạch luồng, giao diện UX rất tốt. Tuy nhiên cần sửa ngay 3 lỗi Critical (Mục 1) để đảm bảo luồng Quản lý và Admin không bị gián đoạn khi thực hiện Cập Nhật dữ liệu.
