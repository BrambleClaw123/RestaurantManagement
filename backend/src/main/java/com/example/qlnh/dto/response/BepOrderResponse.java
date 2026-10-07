package com.example.qlnh.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class BepOrderResponse {
    private String maBan;
    private Long maPhieuGM;
    private String maPhieuHienThi;
    private String thoiGian;
    private String trangThai;
    private String viTriDoi;

    // Bỏ trường ghiChu chung


    private List< BepMonResponse > danhSachMon;
}