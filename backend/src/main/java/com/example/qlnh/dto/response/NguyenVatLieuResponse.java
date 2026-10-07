package com.example.qlnh.dto.response;

import lombok.Data;

@Data
public class NguyenVatLieuResponse {
    private String maNVL;
    private String tenNVL;
    private String donVi;
    private Double soLuongTon;
    private String trangThai;
}