package com.example.qlnh.controller;

import com.example.qlnh.dto.request.BanAnRequest;
import com.example.qlnh.service.BanAnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ban-an")
@CrossOrigin(origins = "*")
public class BanAnController {

    @Autowired
    private BanAnService banAnService;

    // --- API Dropdown ---
    @GetMapping("/trong")
    public ResponseEntity< ? > layDanhSachBanTrong() {
        try {
            return ResponseEntity.ok(banAnService.layDanhSachBanTrong());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // --- CRUD APIs ---
    @GetMapping
    public ResponseEntity< ? > layDanhSachBan() {
        return ResponseEntity.ok(banAnService.layTatCaBan());
    }

    @GetMapping("/{id}")
    public ResponseEntity< ? > layChiTietBan(@PathVariable String id) {
        try {
            return ResponseEntity.ok(banAnService.layChiTietBan(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity< ? > themBanAn(@RequestBody BanAnRequest request) {
        try {
            return ResponseEntity.ok(banAnService.themBanAn(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity< ? > capNhatBanAn(@PathVariable String id, @RequestBody BanAnRequest request) {
        try {
            return ResponseEntity.ok(banAnService.capNhatBanAn(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity< ? > xoaBanAn(@PathVariable String id) {
        try {
            banAnService.xoaBanAn(id);
            return ResponseEntity.ok("Xóa bàn ăn thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}