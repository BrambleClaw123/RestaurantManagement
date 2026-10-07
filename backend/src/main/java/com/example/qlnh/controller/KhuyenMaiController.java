package com.example.qlnh.controller;

import com.example.qlnh.dto.request.KhuyenMaiRequest;
import com.example.qlnh.service.KhuyenMaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/khuyen-mai")
@CrossOrigin(origins = "*")
public class KhuyenMaiController {

    @Autowired
    private KhuyenMaiService khuyenMaiService;

    @GetMapping
    public ResponseEntity< ? > layDanhSach() {
        return ResponseEntity.ok(khuyenMaiService.layDanhSach());
    }

    @GetMapping("/{id}")
    public ResponseEntity< ? > layChiTiet(@PathVariable String id) {
        try {
            return ResponseEntity.ok(khuyenMaiService.layChiTiet(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity< ? > taoKhuyenMai(@RequestBody KhuyenMaiRequest request) {
        try {
            return ResponseEntity.ok(khuyenMaiService.taoKhuyenMai(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity< ? > capNhatKhuyenMai(@PathVariable String id, @RequestBody KhuyenMaiRequest request) {
        try {
            return ResponseEntity.ok(khuyenMaiService.capNhatKhuyenMai(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity< ? > xoaKhuyenMai(@PathVariable String id) {
        try {
            khuyenMaiService.xoaKhuyenMai(id);
            return ResponseEntity.ok("Xóa khuyến mãi thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể xóa do mã khuyến mãi này đã được sử dụng trong hóa đơn!");
        }
    }
}