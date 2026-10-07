package com.example.qlnh.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ChiTietBanPhucVuResponse {
    private String maBan;
    private String tenBan;
    private String trangThai; // "Trống", "Đã đặt", "Đang phục vụ"
    private Long maPhieuGM;
    private String maPhieuHienThi;
    private String tenKhachDatBan;
    private String thoiGianDatBan;

    private List< ChiTietMonPhucVuResponse > danhSachMon;
}