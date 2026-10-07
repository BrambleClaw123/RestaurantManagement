package com.example.qlnh.dto.response.baocao;
import lombok.Data;
import java.util.List;

@Data
public class BaoCaoTonKhoResponse {
    private TongQuan tongQuan;
    private List<ChiTiet> chiTietDanhSach;

    @Data
    public static class TongQuan {
        private Long tongMaHang;
        private Long soLuongSapHet; // Tồn kho < 10
        private Double tongTienNhapTrongKy;
    }

    @Data
    public static class ChiTiet {
        private String maNVL;
        private String tenNVL;
        private String donVi;
        private Double tonHienTai;
        private Double nhapTrongKy;

        public ChiTiet(String maNVL, String tenNVL, String donVi, Double tonHienTai, Double nhapTrongKy) {
            this.maNVL = maNVL;
            this.tenNVL = tenNVL;
            this.donVi = donVi;
            this.tonHienTai = tonHienTai;
            this.nhapTrongKy = nhapTrongKy;
        }
    }
}