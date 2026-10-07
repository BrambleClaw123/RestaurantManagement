package com.example.qlnh.controller;

import com.example.qlnh.dto.request.ApDungKhuyenMaiRequest;
import com.example.qlnh.dto.request.ChotHoaDonRequest;
import com.example.qlnh.service.ThanhToanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thanh-toan")
@CrossOrigin(origins = "*")
public class ThanhToanController {

    @Autowired
    private ThanhToanService thanhToanService;

    // API 1: Lấy danh sách thẻ bài hiển thị các bàn đang phục vụ (Có hỗ trợ tìm kiếm)
    @GetMapping("/ban-dang-phuc-vu")
    public ResponseEntity< ? > layDanhSachBanDangPhucVu(@RequestParam(required = false) String keyword) {
        try {
            return ResponseEntity.ok(thanhToanService.layDanhSachBanDangPhucVu(keyword));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải danh sách bàn: " + e.getMessage());
        }
    }

    // API 2: Lấy chi tiết hóa đơn tạm tính của một phiếu gọi món
    @GetMapping("/chi-tiet/{maPhieuGM}")
    public ResponseEntity< ? > layChiTietThanhToan(@PathVariable Long maPhieuGM) {
        try {
            return ResponseEntity.ok(thanhToanService.layChiTietThanhToan(maPhieuGM));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải chi tiết thanh toán: " + e.getMessage());
        }
    }

    // API 3: Xử lý nút "Hoàn Tất Thanh Toán"
    @PostMapping("/chot-hoa-don")
    public ResponseEntity< ? > chotHoaDon(@RequestBody ChotHoaDonRequest request) {
        try {
            String message = thanhToanService.chotHoaDon(request);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống khi thanh toán: " + e.getMessage());
        }
    }

    @PostMapping("/ap-dung-khuyen-mai")
    public ResponseEntity< ? > apDungKhuyenMai(@RequestBody ApDungKhuyenMaiRequest request) {
        try {
            return ResponseEntity.ok(thanhToanService.apDungKhuyenMai(request.maPhieuGM, request.maKhuyenMai));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi xử lý khuyến mãi: " + e.getMessage());
        }
    }
}