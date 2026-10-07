package com.example.qlnh.controller;

import com.example.qlnh.dto.request.TaiKhoanRequest;
import com.example.qlnh.service.TaiKhoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tai-khoan")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class TaiKhoanController {

    @Autowired
    private TaiKhoanService taiKhoanService;

    // 1. Lấy danh sách toàn bộ tài khoản
    @GetMapping
    public ResponseEntity<?> layDanhSachTaiKhoan(@RequestParam(required = false) String keyword) {
        try {
            return ResponseEntity.ok(taiKhoanService.layDanhSachTaiKhoan(keyword));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tải danh sách: " + e.getMessage());
        }
    }

    // 2. Thêm mới tài khoản
    @PostMapping
    public ResponseEntity<?> themTaiKhoan(@RequestBody TaiKhoanRequest request) {
        try {
            return ResponseEntity.ok(taiKhoanService.themTaiKhoan(request));
        } catch (IllegalArgumentException e) {
            // Bắt lỗi Validation từ Service quăng ra và gửi về FE với status 400
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Bắt các lỗi hệ thống khác
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // 3. API Cập nhật tài khoản (Dùng cho Modal Sửa)
    @PutMapping("/{maNV}")
    public ResponseEntity<?> capNhatTaiKhoan(
            @PathVariable String maNV,
            @RequestBody TaiKhoanRequest request) {
        try {
            return ResponseEntity.ok(taiKhoanService.capNhatTaiKhoan(maNV, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // 4. API Đổi trạng thái nhanh (Dùng cho Nút Khóa/Mở khóa trên bảng)
    @PutMapping("/{maNV}/trang-thai")
    public ResponseEntity<?> thayDoiTrangThai(@PathVariable String maNV) {
        try {
            return ResponseEntity.ok(taiKhoanService.thayDoiTrangThai(maNV));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // 5. API Đặt lại mật khẩu ngẫu nhiên
    @PutMapping("/{maNV}/reset-password")
    public ResponseEntity<?> datLaiMatKhau(@PathVariable String maNV) {
        try {
            String matKhauMoi = taiKhoanService.datLaiMatKhau(maNV);
            return ResponseEntity.ok(java.util.Map.of("matKhauMoi", matKhauMoi));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}