package com.example.qlnh.controller;

import com.example.qlnh.dto.request.PhieuDatBanRequest;
import com.example.qlnh.service.PhieuDatBanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phieu-dat-ban")
@CrossOrigin(origins = "*")
public class PhieuDatBanController {

    @Autowired
    private PhieuDatBanService phieuDatBanService;

    @GetMapping
    public ResponseEntity<?> layDanhSach() {
        return ResponseEntity.ok(phieuDatBanService.layDanhSach());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layChiTiet(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(phieuDatBanService.layChiTiet(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> taoPhieuDatBan(@RequestBody PhieuDatBanRequest request) {
        try {
            return ResponseEntity.ok(phieuDatBanService.taoPhieuDatBan(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatPhieu(@PathVariable Long id, @RequestBody PhieuDatBanRequest request) {
        try {
            return ResponseEntity.ok(phieuDatBanService.capNhatPhieu(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaPhieu(@PathVariable Long id) {
        try {
            phieuDatBanService.xoaPhieu(id);
            return ResponseEntity.ok("Xóa phiếu đặt bàn thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/da-den")
    public ResponseEntity<?> xacNhanDenQuan(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(phieuDatBanService.xacNhanDenQuan(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}