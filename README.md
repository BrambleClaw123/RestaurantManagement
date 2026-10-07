# HỆ THỐNG QUẢN LÝ NHÀ HÀNG (RESTAURANT MANAGEMENT SYSTEM)

Dự án quản lý nhà hàng toàn diện (Full-stack Restaurant Management System), hỗ trợ đồng bộ hóa thời gian thực giữa các bộ phận: **Lễ tân (Reception)**, **Phục vụ (Waiter)**, **Bếp (Kitchen - KDS)**, **Kho nguyên liệu (Warehouse)** và **Quản trị (Admin / Manager)**.

---

## 📑 MỤC LỤC
1. [Yêu cầu hệ thống (Prerequisites)](#1-yêu-cầu-hệ-thống-prerequisites)
2. [Cấu hình Cơ sở dữ liệu (Database Setup)](#2-cấu-hình-cơ-sở-dữ-liệu-database-setup)
3. [Hướng dẫn khởi động Backend (Spring Boot)](#3-hướng-dẫn-khởi-động-backend-spring-boot)
4. [Hướng dẫn khởi động Frontend (React + Vite)](#4-hướng-dẫn-khởi-động-frontend-react--vite)
5. [Tài khoản mặc định & Đăng nhập](#5-tài-khoản-mặc-định--đăng-nhập)
6. [Danh sách các phân hệ & Đường dẫn (Routes)](#6-danh-sách-các-phân-hệ--đường-dẫn-routes)
7. [Xử lý sự cố thường gặp (Troubleshooting)](#7-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. YÊU CẦU HỆ THỐNG (PREREQUISITES)

Trước khi khởi động dự án, máy tính cần được cài đặt sẵn:

- **Java Development Kit (JDK)**: Phiên bản **Java 17** hoặc **Java 21+** (Đã cấu hình biến môi trường `JAVA_HOME`).
- **Node.js**: Phiên bản **Node 18.x** hoặc **Node 20.x+** kèm **npm**.
- **MySQL Server**: Phiên bản **MySQL 8.0+** (đang chạy dịch vụ tại cổng `3306`).
- **Git** (nếu thao tác qua command line).

---

## 2. CẤU HÌNH CƠ SỞ DỮ LIỆU (DATABASE SETUP)

### 2.1. Tạo Database MySQL
Mở MySQL Workbench, DBeaver, Navicat hoặc Terminal MySQL và chạy câu lệnh sau:

```sql
CREATE DATABASE IF NOT EXISTS nexuscore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2. Kiểm tra cấu hình kết nối Backend
Mở file `backend/src/main/resources/application.properties` và điều chỉnh thông tin tài khoản MySQL của bạn (nếu mật khẩu khác mặc định):

```properties
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/nexuscore_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=12345
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Tự động tạo và cập nhật bảng CSDL từ Entity
spring.jpa.hibernate.ddl-auto=update

spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

> **Lưu ý:** Hibernate sẽ tự động sinh toàn bộ bảng dữ liệu khi khởi động Backend lần đầu tiên nhờ cấu hình `ddl-auto=update`.

---

## 3. HƯỚNG DẪN KHỞI ĐỘNG BACKEND (SPRING BOOT)

Backend được viết bằng Java Spring Boot, sử dụng cổng mặc định **`8080`**.

### Bước 1: Mở Terminal tại thư mục `backend`
```bash
cd backend
```

### Bước 2: Chạy ứng dụng

#### 👉 Cách 1: Sử dụng Maven Wrapper có sẵn trong dự án (Khuyên dùng)
- **Trên Windows (PowerShell / Command Prompt)**:
  ```powershell
  .\mvnw.cmd spring-boot:run
  ```
- **Trên macOS / Linux**:
  ```bash
  chmod +x mvnw
  ./mvnw spring-boot:run
  ```

#### 👉 Cách 2: Sử dụng Maven toàn cục (nếu máy đã cài Apache Maven)
```bash
mvn spring-boot:run
```

#### 👉 Cách 3: Chạy trực tiếp từ IDE
Mở thư mục `backend` bằng **IntelliJ IDEA** hoặc **Eclipse / VS Code**, tìm đến class chính:
`src/main/java/com/example/qlnh/DemoApplication.java` và nhấn **Run / Debug**.

### Bước 3: Xác nhận Backend đã sẵn sàng
Khi khởi động thành công, terminal sẽ in ra log tương tự:
```text
========== HỆ THỐNG ĐÃ TẠO TÀI KHOẢN MẶC ĐỊNH ==========
Tên đăng nhập: admin
Mật khẩu: admin123
========================================================
... Started DemoApplication in X.XXX seconds (process running for ...)
```
Backend API sẽ hoạt động tại: **`http://localhost:8080`**.

---

## 4. HƯỚNG DẪN KHỞI ĐỘNG FRONTEND (REACT + VITE)

Frontend được xây dựng bằng React 19, Vite và TailwindCSS, sử dụng cổng mặc định **`5173`**.

### Bước 1: Mở một cửa sổ Terminal MỚI tại thư mục `frontend`
```bash
cd frontend
```

### Bước 2: Cài đặt các thư viện (chỉ cần chạy lần đầu tiên)
```bash
npm install
```

### Bước 3: Khởi động Development Server
```bash
npm run dev
```

### Bước 4: Truy cập ứng dụng
Sau khi lệnh hoàn tất, Terminal sẽ hiển thị đường link:
```text
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Mở trình duyệt Web (Chrome, Edge, Firefox) và truy cập vào: **`http://localhost:5173`**.

---

## 5. TÀI KHOẢN MẶC ĐỊNH & ĐĂNG NHẬP

Khi Backend khởi động lần đầu, bộ khởi tạo `DatabaseSeeder.java` sẽ tự động tạo tài khoản Quản trị viên (Admin):

| Thông tin | Giá trị |
| :--- | :--- |
| **URL Đăng nhập** | `http://localhost:5173/login` |
| **Tên đăng nhập (Username)** | `admin` |
| **Mật khẩu (Password)** | `admin123` |
| **Vai trò (Role)** | `ADMIN` (Quản trị hệ thống) |

> 💡 **Mẹo:** Sau khi đăng nhập với tài khoản `admin`, bạn có thể vào trang Quản trị (`/admin`) để thêm nhân viên mới và cấp tài khoản cho các vai trò khác (Phục vụ, Lễ tân, Bếp, Kho, Quản lý).

---

## 6. DANH SÁCH CÁC PHÂN HỆ & ĐƯỜNG DẪN (ROUTES)

Dự án phân chia các phân hệ chuyên biệt theo vai trò người dùng:

| Phân hệ / Vai trò | Đường dẫn (URL) | Mô tả nghiệp vụ chính |
| :--- | :--- | :--- |
| **Đăng nhập** | `/login` | Đăng nhập tài khoản, xác thực mã Token JWT |
| **Lễ tân / Thu ngân** | `/reception` | Đặt bàn, quản lý khách hẹn, chốt hóa đơn & thanh toán |
| **Phục vụ (Waiter)** | `/waiter` | Sơ đồ bàn, mở bàn, gọi món, sửa/hủy món, xem tình trạng bếp |
| **Bếp (Kitchen / KDS)** | `/kitchen` | Màn hình hiển thị bếp theo thứ tự FIFO, báo hoàn tất, quản lý còn/hết món |
| **Kho nguyên liệu** | `/warehouse` | Quản lý tồn kho, nhập kho nguyên vật liệu, nhà cung cấp |
| **Quản lý (Manager)** | `/manager` | Xem báo cáo doanh thu, thống kê món ăn bán chạy, biểu đồ kinh doanh |
| **Quản trị viên (Admin)** | `/admin` | Quản trị tài khoản nhân viên, phân quyền người dùng, danh mục bàn ăn |

---

## 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### 1. Lỗi kết nối CSDL (`Communications link failure` hoặc `Access denied for user 'root'@'localhost'`)
- Kiểm tra xem dịch vụ MySQL Server đã được bật chưa (kiểm tra trong Services trên Windows hoặc chạy `mysql -u root -p`).
- Kiểm tra lại mật khẩu `spring.datasource.password` trong file `application.properties` xem đã khớp với mật khẩu MySQL trên máy bạn chưa.
- Đảm bảo đã chạy lệnh tạo cơ sở dữ liệu `CREATE DATABASE nexuscore_db;`.

### 2. Trùng cổng `8080` (Backend) hoặc `5173` (Frontend)
- **Nếu cổng 8080 đã bị chiếm dụng**: Đổi cổng trong file `backend/src/main/resources/application.properties` thành `server.port=8081`, sau đó cập nhật biến môi trường frontend `VITE_API_BASE_URL=http://localhost:8081`.
- **Nếu cổng 5173 bị chiếm dụng**: Vite sẽ tự động đề xuất chuyển sang cổng `5174` hoặc bạn có thể chỉ định cổng mới trong lệnh: `npm run dev -- --port 3000`.

### 3. Lỗi quyền thực thi script `./mvnw` trên Linux/macOS
Nếu gặp lỗi `Permission denied` khi chạy `./mvnw`, cấp quyền thực thi cho file:
```bash
chmod +x mvnw
```

### 4. Phiên đăng nhập hết hạn hoặc lỗi CORS
- Hệ thống sử dụng Bearer Token JWT lưu tại `localStorage`. Nếu token hết hạn, hệ thống sẽ tự động điều hướng về màn hình `/login`.
- Backend đã cấu hình `@CrossOrigin(origins = "*")` sẵn sàng cho môi trường phát triển cục bộ.

---

## 📚 TÀI LIỆU CHI TIẾT
- Báo cáo phân tích chuyên sâu 3 luồng nghiệp vụ: [docs/business.md](docs/business.md)
- Danh mục API chi tiết: [docs/api_docs.md](docs/api_docs.md)
"# RestaurantManagement" 
