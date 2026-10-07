package com.example.qlnh.dto.response;

import lombok.Data;

@Data
public class DanhSachBanPhucVuResponse {
    private String maBan;
    private String tenBan; // Hiển thị "Bàn 03"
    private Long maPhieuGM;
    private String maPhieuHienThi; // Hiển thị "#ORD-302"
    private String tenKhachHang;
    private String soDienThoai;
    private String trangThai;
}