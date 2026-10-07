package com.example.qlnh.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PhieuNhapKhoResponse {
    private Long id; // Giữ lại ID thật để dành cho việc FE làm nút "Xem chi tiết" ở cột THAO TÁC
    private String maPhieu; // Hiển thị dạng #PNK-2026-0089 giống ảnh trước của bạn
    private LocalDateTime ngayNhap;
    private String nhaCungCap;
    private String nguoiLap;
    private Double tongTien;
}