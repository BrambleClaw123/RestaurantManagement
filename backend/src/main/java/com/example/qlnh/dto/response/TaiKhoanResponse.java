package com.example.qlnh.dto.response;

import com.example.qlnh.enums.VaiTro;
import lombok.Data;

@Data
public class TaiKhoanResponse {
    private String maNV;
    private String tenDangNhap;
    private String matKhau;
    private String hoTenNhanVien;
    private VaiTro vaiTro;
    private Integer trangThai;
}