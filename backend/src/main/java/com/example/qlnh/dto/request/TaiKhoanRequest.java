package com.example.qlnh.dto.request;

import lombok.Data;

@Data
public class TaiKhoanRequest {
    private String maNV;
    private String tenDangNhap;
    private String matKhau;
    private Integer trangThai;
}