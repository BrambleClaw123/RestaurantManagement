package com.example.qlnh.controller;

import com.example.qlnh.dto.request.MonAnRequest;
import com.example.qlnh.service.MonAnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mon-an")
@CrossOrigin(origins = "*")
public class MonAnController {

    @Autowired
    private MonAnService monAnService;

    // 1. Danh sách có lọc & tìm kiếm
    @GetMapping
    public ResponseEntity<?> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String loaiMon) {
        return ResponseEntity.ok(monAnService.layDanhSach(keyword, loaiMon));
    }

    // 2. Lấy dữ liệu 4 thẻ thống kê
    @GetMapping("/thong-ke")
    public ResponseEntity<?> layThongKe() {
        return ResponseEntity.ok(monAnService.layThongKe());
    }

    // 3. Xem chi tiết (để đổ vào modal Chỉnh sửa)
    @GetMapping("/{id}")
    public ResponseEntity<?> layChiTiet(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(monAnService.layChiTiet(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Thêm món mới
    @PostMapping
    public ResponseEntity<?> themMonAn(@RequestBody MonAnRequest request) {
        return ResponseEntity.ok(monAnService.themMonAn(request));
    }

    // 5. Cập nhật món ăn
    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatMonAn(
            @PathVariable Long id,
            @RequestBody MonAnRequest request) {
        try {
            return ResponseEntity.ok(monAnService.capNhatMonAn(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}