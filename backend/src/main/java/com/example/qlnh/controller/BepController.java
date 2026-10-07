package com.example.qlnh.controller;

import com.example.qlnh.dto.request.CapNhatTrangThaiMonRequest;
import com.example.qlnh.service.BepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bep")
@CrossOrigin(origins = "*")
public class BepController {

    @Autowired
    private BepService bepService;

    @GetMapping("/danh-sach-order")
    public ResponseEntity< ? > layDanhSachOrderBep() {
        try {
            return ResponseEntity.ok(bepService.layDanhSachOrder());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải danh sách bếp: " + e.getMessage());
        }
    }

    @PostMapping("/hoan-tat/{maPhieuGM}")
    public ResponseEntity< ? > hoanTatOrder(@PathVariable Long maPhieuGM) {
        try {
            bepService.hoanTatOrder(maPhieuGM);
            // Sau khi hoàn tất thành công, FE tự động gọi lại API GET /danh-sach-order để refresh màn hình
            return ResponseEntity.ok("Đã xuất món cho phiếu #" + maPhieuGM);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xử lý ra món: " + e.getMessage());
        }
    }

    // API Lấy danh sách thực đơn (có tìm kiếm)
    @GetMapping("/thuc-don")
    public ResponseEntity< ? > layDanhSachThucDon(@RequestParam(required = false) String keyword) {
        try {
            return ResponseEntity.ok(bepService.layDanhSachThucDon(keyword));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải thực đơn: " + e.getMessage());
        }
    }

    // API Cập nhật trạng thái
    @PutMapping("/thuc-don/{maMon}/trang-thai")
    public ResponseEntity< ? > capNhatTrangThaiMon(
            @PathVariable Long maMon, // Đổi thành Long
            @RequestBody CapNhatTrangThaiMonRequest request) {
        try {
            bepService.capNhatTrangThaiMon(maMon, request.getConMon());
            return ResponseEntity.ok("Cập nhật trạng thái món thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi cập nhật trạng thái: " + e.getMessage());
        }
    }
}