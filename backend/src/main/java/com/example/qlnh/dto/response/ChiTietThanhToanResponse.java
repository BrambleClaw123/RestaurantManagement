package com.example.qlnh.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ChiTietThanhToanResponse {
    private String tenBan;
    private String maPhieuHienThi;
    private String tenKhachHang;
    private String trangThai;

    private List< ChiTietMonResponse > danhSachMon;
    private Double tienKhuyenMai;

    // Phần tổng kết tiền nong
    private Double tongTienMon;
    private Double thueVAT; // VAT 8%
    private Double tongThanhToan;
}