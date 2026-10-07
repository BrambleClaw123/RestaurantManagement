package com.example.qlnh.dto.request;

import lombok.Data;

@Data
public class BanAnRequest {
    private String maBan;
    private String tenBan;
    private Integer soCho;
    private String trangThai; // "Trống", "Đang phục vụ", "Bảo trì", v.v.
}