package com.example.qlnh.dto.response;

import com.example.qlnh.enums.LoaiMon;
import lombok.Data;

@Data
public class ThucDonPhucVuResponse {
    private Long maMon;
    private String tenMon;
    private LoaiMon loaiMon; // Đã đổi sang Enum LoaiMon
    private Double donGia;
}