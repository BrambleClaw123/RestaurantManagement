package com.example.qlnh.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HoaDonResponse {
    private Long maHD;
    private String maHoaDonHienThi;
    private String maPhieuHienThi;
    private String tenBan;
    private String tenKhachHang;
    private String tenNhanVien;
    private LocalDateTime ngayGio;

    private List< ChiTietMonResponse > danhSachMon;
    private Double tongTienMon;
    private String maKhuyenMai;
    private Double tienKhuyenMai;
    private Double thueVAT;
    private Double tongThanhToan;

    private String phuongThucThanhToan;
    private Double soTienKhachDua;
    private Double tienThua;
    private String maGiaoDich;
}
