package com.example.qlnh.dto.response.baocao;
import lombok.Data;
import java.util.List;

@Data
public class BaoCaoBanChayResponse {
    private TongQuan tongQuan;
    private List<ChiTiet> chiTietDanhSach;

    @Data
    public static class TongQuan {
        private String monBanChayNhat;
        private Long tongSoPhanDaBan;
        private Double tongDoanhThuMon;
    }

    @Data
    public static class ChiTiet {
        private String tenMon;
        private String loaiMon;
        private Long soLuongBan;
        private Double tongTienThuDuoc;

        public ChiTiet(String tenMon, String loaiMon, Long soLuongBan, Double tongTienThuDuoc) {
            this.tenMon = tenMon;
            this.loaiMon = loaiMon;
            this.soLuongBan = soLuongBan;
            this.tongTienThuDuoc = tongTienThuDuoc;
        }
    }
}