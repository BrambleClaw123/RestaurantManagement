package com.example.qlnh.controller;

import com.example.qlnh.dto.request.NguyenVatLieuRequest;
import com.example.qlnh.dto.request.TaoPhieuNhapRequest;
import com.example.qlnh.service.KhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/kho")
@CrossOrigin(origins = "*")
public class KhoController {

    @Autowired
    private KhoService khoService;

    // API 1: Lấy 4 con số thống kê ở trên cùng màn hình
    @GetMapping("/thong-ke")
    public ResponseEntity< ? > layThongKe() {
        try {
            return ResponseEntity.ok(khoService.layThongKe());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi tải thống kê kho: " + e.getMessage());
        }
    }

    // API 2: Lấy danh sách nguyên vật liệu (kèm chức năng tìm kiếm)
    @GetMapping("/nguyen-vat-lieu")
    public ResponseEntity< ? > layDanhSachNVL(@RequestParam(required = false) String keyword) {
        try {
            return ResponseEntity.ok(khoService.layDanhSachNVL(keyword));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải danh sách nguyên vật liệu: " + e.getMessage());
        }
    }

    // API Lấy danh sách Nhà cung cấp (cho dropdown)
    
    @PostMapping("/nha-cung-cap")
    public ResponseEntity<?> themNhaCungCap(@RequestBody java.util.Map<String, String> request) {
        try {
            return ResponseEntity.ok(khoService.themNhaCungCap(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/nha-cung-cap")
    public ResponseEntity< ? > layDanhSachNhaCungCap() {
        return ResponseEntity.ok(khoService.layDanhSachNhaCungCap());
    }

    // API Tạo phiếu nhập (Bấm nút "Lưu Phiếu Lại")
    @PostMapping("/phieu-nhap")
    public ResponseEntity< ? > taoPhieuNhapKho(@RequestBody TaoPhieuNhapRequest request) {
        try {
            String message = khoService.taoPhieuNhapKho(request);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống khi lưu phiếu nhập: " + e.getMessage());
        }
    }

    // Lấy danh sách lịch sử phiếu nhập (có ô tìm kiếm)
    @GetMapping("/phieu-nhap")
    public ResponseEntity< ? > layDanhSachPhieuNhap(@RequestParam(required = false) String keyword) {
        try {
            return ResponseEntity.ok(khoService.layDanhSachPhieuNhap(keyword));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi tải danh sách phiếu nhập: " + e.getMessage());
        }
    }

    @GetMapping("/bao-cao")
    public ResponseEntity< ? > layBaoCaoKho(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        try {
            return ResponseEntity.ok(khoService.layBaoCaoKho(tuNgay, denNgay));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi trích xuất báo cáo: " + e.getMessage());
        }
    }

    // API 3: Thêm nguyên vật liệu mới
    @PostMapping("/nguyen-vat-lieu")
    public ResponseEntity< ? > themNguyenVatLieu(@RequestBody NguyenVatLieuRequest request) {
        try {
            return ResponseEntity.ok(khoService.themNguyenVatLieu(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // API 4: Sửa nguyên vật liệu
    @PutMapping("/nguyen-vat-lieu/{maNVL}")
    public ResponseEntity< ? > suaNguyenVatLieu(
            @PathVariable String maNVL,
            @RequestBody NguyenVatLieuRequest request) {
        try {
            return ResponseEntity.ok(khoService.suaNguyenVatLieu(maNVL, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // API 5: Xóa nguyên vật liệu
    @DeleteMapping("/nguyen-vat-lieu/{maNVL}")
    public ResponseEntity< ? > xoaNguyenVatLieu(@PathVariable String maNVL) {
        try {
            khoService.xoaNguyenVatLieu(maNVL);
            return ResponseEntity.ok("Đã xóa nguyên vật liệu thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // Xem chi tiết Phiếu nhập
    @GetMapping("/phieu-nhap/{id}")
    public ResponseEntity<?> layChiTietPhieuNhap(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(khoService.layChiTietPhieuNhap(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // Cập nhật Phiếu nhập
    @PutMapping("/phieu-nhap/{id}")
    public ResponseEntity<?> capNhatPhieuNhap(@PathVariable Long id, @RequestBody TaoPhieuNhapRequest request) {
        try {
            String message = khoService.suaPhieuNhap(id, request);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // Xóa Phiếu nhập
    @DeleteMapping("/phieu-nhap/{id}")
    public ResponseEntity<?> xoaPhieuNhap(@PathVariable Long id) {
        try {
            khoService.xoaPhieuNhap(id);
            return ResponseEntity.ok("Đã xóa phiếu nhập và phục hồi tồn kho thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}