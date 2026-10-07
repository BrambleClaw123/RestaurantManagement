package com.example.qlnh.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class BaoCaoKhoResponse {
    private Long tongMatHang;         // Trả ra số 8
    private Double tongNhapToanKho;   // Trả ra 237.0
    private Double tongTonKhoHienTai; // Trả ra 268.2
    private Double tongTienNhapTrongKy;

    private List< ChiTietBaoCao > danhSach;

    @Data
    public static class ChiTietBaoCao {
        private String maNVL;
        private String tenNVL;
        private String donVi;
        private Double nhapTrongKy;
        private Double tonKhoHienTai;
        private String trangThai;
    }
}