package com.example.qlnh.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PhieuDatBanRequest {
    private String tenKhachHang;
    private String soDienThoai;
    private LocalDate ngayDat;
    private LocalTime gioDat;
    private String maBan; // Lấy từ dropdown chọn bàn
    private Integer soNguoiLon;
    private Integer soTreEm;
    private String yeuCau;
}