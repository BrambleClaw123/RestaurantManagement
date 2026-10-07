package com.example.qlnh.controller;

import com.example.qlnh.dto.request.SuaSoLuongRequest;
import com.example.qlnh.dto.request.ThemMonRequest;
import com.example.qlnh.service.PhucVuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phuc-vu")
@CrossOrigin(origins = "*")
public class PhucVuController {

    @Autowired
    private PhucVuService phucVuService;

    // API 0: Lấy toàn bộ danh sách bàn (Hiển thị màn hình chính)
    @GetMapping("/ban")
    public ResponseEntity< ? > layDanhSachBanTongQuan() {
        try {
            return ResponseEntity.ok(phucVuService.layDanhSachBanTongQuan());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải danh sách bàn: " + e.getMessage());
        }
    }

    @GetMapping("/ban/{maBan}")
    public ResponseEntity< ? > layChiTietBan(@PathVariable String maBan) {
        try {
            return ResponseEntity.ok(phucVuService.layChiTietBan(maBan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi tải chi tiết bàn: " + e.getMessage());
        }
    }

    // API 2: Mở bàn (Chuyển trạng thái Trống/Đã đặt -> Đang phục vụ)
    @PostMapping("/ban/{maBan}/mo-ban")
    public ResponseEntity< ? > moBan(@PathVariable String maBan, @RequestParam(required = false) String maNV) {
        try {
            String message = phucVuService.moBan(maBan, maNV);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi mở bàn: " + e.getMessage());
        }
    }

    // Lấy menu cho UI chọn món (Tab Tất Cả, Món Chính...)
    @GetMapping("/thuc-don")
    public ResponseEntity< ? > layThucDon() {
        return ResponseEntity.ok(phucVuService.layThucDon());
    }

    // Thêm món vào bàn (Bấm "Thêm Vào Bàn")
    @PostMapping("/phieu/{maPhieuGM}/them-mon")
    public ResponseEntity< ? > themMonVaoBan(@PathVariable Long maPhieuGM, @RequestBody ThemMonRequest request) {
        try {
            phucVuService.themMonVaoBan(maPhieuGM, request);
            return ResponseEntity.ok("Thêm món thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cập nhật số lượng (Bấm Icon Cây Bút)
    @PutMapping("/chi-tiet-mon/{id}")
    public ResponseEntity< ? > suaSoLuongMon(
            @PathVariable Long id,
            @RequestBody SuaSoLuongRequest request) {
        try {
            phucVuService.suaSoLuongMon(id, request.getSoLuongMoi());
            return ResponseEntity.ok("Đã cập nhật số lượng!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Sẽ trả về lỗi nếu Bếp đang nấu
        }
    }

    // Xóa món (Bấm Icon Thùng Rác)
    @DeleteMapping("/chi-tiet-mon/{id}")
    public ResponseEntity< ? > xoaMonAn(@PathVariable Long id) {
        try {
            phucVuService.xoaMonAn(id);
            return ResponseEntity.ok("Đã hủy món thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Sẽ trả về lỗi nếu Bếp đang nấu
        }
    }
}