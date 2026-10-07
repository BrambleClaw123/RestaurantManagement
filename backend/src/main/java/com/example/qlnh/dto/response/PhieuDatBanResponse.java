package com.example.qlnh.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PhieuDatBanResponse {
    private Long maPhieuDB;
    private String maPhieuHienThi;
    private String tenKhachHang;
    private String soDienThoai;

    // Tách thành 2 field riêng biệt để FE dễ binding vào form
    private LocalDate ngayDat;
    private LocalTime gioDat;

    private String maBan;
    private Integer soNguoiLon;
    private Integer soTreEm;
    private String yeuCau;
    private String trangThai;
}