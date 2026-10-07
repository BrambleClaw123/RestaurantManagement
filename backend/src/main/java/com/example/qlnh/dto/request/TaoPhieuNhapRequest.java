package com.example.qlnh.dto.request;
import lombok.Data;
import java.util.List;

@Data
public class TaoPhieuNhapRequest {
    private String maNCC; // Lấy từ dropdown Nhà cung cấp
    private String lyDoNhap;
    private Double tongTienThanhToan;
    private List< ChiTietNhap > danhSachHang;

    @Data
    public static class ChiTietNhap {
        private String maNVL;
        private Double soLuong;
        private Double donGia;
    }
}