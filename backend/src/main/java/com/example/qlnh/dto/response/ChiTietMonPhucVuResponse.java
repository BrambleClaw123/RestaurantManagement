package com.example.qlnh.dto.response;

import lombok.Data;

@Data
public class ChiTietMonPhucVuResponse {
    private Long id;
    private Long maMon;
    private String tenMon;
    private Integer soLuong;
    private Double donGia;
    private String trangThaiBep; // "Chờ chế biến", "Đang nấu", "Đã xong"
    private String ghiChu;
}