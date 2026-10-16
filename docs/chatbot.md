# Chatbot trợ lý (Gemini) – tài liệu báo cáo

## 1. Mục tiêu
Tích hợp chatbot vào hệ thống quản lý nhà hàng để nhân viên hỏi bằng tiếng Việt và nhận câu trả lời dựa trên **dữ liệu thật** của hệ thống, **theo đúng quyền của vai trò** đang đăng nhập.

## 2. Kiến trúc
```
React (ChatWidget, nằm trong MainLayout)
   │  POST /api/chat  (kèm JWT)
   ▼
ChatController ──► ChatService ──► GeminiClient ──► Google Gemini API
                        │   ▲
        functionCall    ▼   │ functionResponse
                    ChatTools ──► MonAnService / BanAnService / BepService / KhoService / BaoCaoService ──► MySQL
```
- **ChatWidget.jsx**: nút nổi góc phải, gắn trong `MainLayout` nên xuất hiện ở cả 6 màn hình (Lễ tân, Phục vụ, Bếp, Kho, Quản lý, Admin).
- **ChatController**: `POST /api/chat`, nằm sau `JwtFilter` nên bắt buộc đăng nhập.
- **ChatService**: điều phối vòng lặp hỏi – gọi công cụ – trả lời (tối đa 5 bước).
- **GeminiClient**: gọi REST `generateContent`, không cần thêm thư viện vào `pom.xml`.
- **ChatTools**: các công cụ (function calling) Gemini được phép gọi.

## 3. Cách hoạt động (Function Calling / tool use)
1. Backend gửi câu hỏi + danh sách công cụ cho Gemini.
2. Gemini không tự biết dữ liệu nhà hàng nên trả về yêu cầu gọi công cụ, ví dụ `bao_cao_doanh_thu(tu_ngay, den_ngay)`.
3. Backend chạy công cụ (gọi service có sẵn, đọc MySQL) và gửi kết quả lại.
4. Gemini diễn đạt kết quả thành câu trả lời tiếng Việt.

Nhờ đó chatbot không bịa số liệu: mọi con số đều đến từ cơ sở dữ liệu.

## 4. Phân quyền theo vai trò
| Công cụ | Dữ liệu | Vai trò được dùng |
|---|---|---|
| xem_thuc_don, thong_ke_thuc_don | Thực đơn, giá, tình trạng | Tất cả (trừ Admin) |
| xem_nhan_vien, xem_tai_khoan | Nhân viên, tài khoản (không bao giờ trả mật khẩu) | Chỉ Admin |
| xem_trang_thai_ban | Bàn trống / có khách | Phục vụ, Lễ tân, Quản lý |
| xem_don_bep | Order đang ở bếp | Đầu bếp, Quản lý |
| xem_ton_kho | Nguyên liệu, sắp hết | Nhân viên kho, Quản lý |
| bao_cao_doanh_thu, bao_cao_mon_ban_chay | Báo cáo | Quản lý |

Vai trò lấy từ JWT. Phân quyền được kiểm tra **hai lần**: chỉ khai báo cho Gemini các công cụ hợp vai trò, và kiểm tra lại khi thực thi.

## 5. An toàn
- Chỉ **đọc** dữ liệu, không có công cụ thêm/sửa/xóa.
- Mỗi công cụ chỉ trả các trường cần thiết, giới hạn số dòng.
- Prompt hệ thống cấm bịa số liệu, cấm làm ngoài phạm vi, bỏ qua yêu cầu "đổi luật".
- API key đặt bằng biến môi trường `GEMINI_API_KEY`, không ghi vào mã nguồn.
- Giới hạn độ dài câu hỏi (2000 ký tự) và số lượt lịch sử (10).

## 6. Cấu hình & chạy
1. Tạo API key tại https://aistudio.google.com/apikey
2. Đặt biến môi trường trước khi chạy backend:
   - Windows (PowerShell): `$env:GEMINI_API_KEY="your-key"`
   - Linux/Mac: `export GEMINI_API_KEY=your-key`
   - (tùy chọn) `GEMINI_MODEL`, mặc định `gemini-3.5-flash-lite`
3. Chạy backend và frontend như bình thường, đăng nhập, bấm nút 💬 góc phải.

## 7. Câu hỏi demo gợi ý
- Quản lý: "Doanh thu hôm nay?", "Món nào bán chạy nhất tháng này?", "Nguyên liệu nào sắp hết?"
- Bếp: "Bếp đang có order nào?"
- Phục vụ: "Còn bàn nào trống?"
- Thử quyền: đăng nhập bằng tài khoản Phục vụ và hỏi "Doanh thu hôm nay?" → chatbot từ chối vì không đủ quyền.

## 8. Hạn chế & hướng phát triển
- Chưa cho phép thao tác ghi (đặt món, đặt bàn qua chat).
- Chưa lưu lịch sử hội thoại lâu dài, chưa giới hạn tần suất theo người dùng.
- Có thể mở rộng: RAG cho tài liệu hướng dẫn, gợi ý món, dự báo nhập kho.
