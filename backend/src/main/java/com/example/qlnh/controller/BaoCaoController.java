package com.example.qlnh.controller;

import com.example.qlnh.service.BaoCaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/bao-cao")
@CrossOrigin(origins = "*")
public class BaoCaoController {

    @Autowired
    private BaoCaoService baoCaoService;

    // Hàm tiện ích chuyển Date -> DateTime
    private LocalDateTime getStartOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    private LocalDateTime getEndOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    @GetMapping("/doanh-thu")
    public ResponseEntity<?> baoCaoDoanhThu(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        return ResponseEntity.ok(baoCaoService.layBaoCaoDoanhThu(getStartOfDay(tuNgay), getEndOfDay(denNgay)));
    }

    @GetMapping("/ban-chay")
    public ResponseEntity<?> baoCaoBanChay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        return ResponseEntity.ok(baoCaoService.layBaoCaoBanChay(getStartOfDay(tuNgay), getEndOfDay(denNgay)));
    }

    @GetMapping("/ton-kho")
    public ResponseEntity<?> baoCaoTonKho(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        return ResponseEntity.ok(baoCaoService.layBaoCaoTonKho(getStartOfDay(tuNgay), getEndOfDay(denNgay)));
    }
}