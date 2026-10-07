package com.example.qlnh.controller;

import com.example.qlnh.dto.request.NhaCungCapRequest;
import com.example.qlnh.service.NhaCungCapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nha-cung-cap")
@CrossOrigin(origins = "*")
public class NhaCungCapController {

    @Autowired
    private NhaCungCapService service;

    @GetMapping
    public ResponseEntity<?> layDanhSach(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(service.layDanhSach(keyword));
    }

    @GetMapping("/thong-ke")
    public ResponseEntity<?> layThongKe() {
        return ResponseEntity.ok(service.layThongKe());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layChiTiet(@PathVariable String id) {
        try {
            return ResponseEntity.ok(service.layChiTiet(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatNhaCungCap(@PathVariable String id, @RequestBody NhaCungCapRequest request) {
        try {
            return ResponseEntity.ok(service.capNhatNhaCungCap(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> themNhaCungCap(@RequestBody NhaCungCapRequest request) {
        return ResponseEntity.ok(service.themNhaCungCap(request));
    }
}