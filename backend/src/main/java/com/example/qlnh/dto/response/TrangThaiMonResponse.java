package com.example.qlnh.dto.response;

import lombok.Data;

@Data
public class TrangThaiMonResponse {
    private Long maMon; // Sửa thành Long theo Entity
    private String tenMon;
    private String loaiMon;
    private String donViTinh;
    private Boolean conMon; // FE vẫn nhận boolean để gắn vào công tắc gạt
}