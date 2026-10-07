package com.example.qlnh.dto.response.baocao;
import lombok.Data;
import java.util.List;

@Data
public class BaoCaoDoanhThuResponse {
    private TongQuan tongQuan;
    private List<ChiTiet> chiTietDanhSach;

    @Data
    public static class TongQuan {
        private Double tongDoanhThu;
        private Long tongHoaDon;
        private Double giaTriTrungBinhDon;
        private Double thucThuSauThue;
    }

    @Data
    public static class ChiTiet {
        private String ngayHoatDong; // SQL trả về dạng yyyy-MM-dd
        private Long soLuongDon;
        private Double doanhSoBan;
        private Double thueVat;
        private Double thucThu;

        public ChiTiet(java.sql.Date ngay, Long soLuongDon, Double doanhSoBan, Double thueVat, Double thucThu) {
            this.ngayHoatDong = ngay.toString();
            this.soLuongDon = soLuongDon;
            this.doanhSoBan = doanhSoBan;
            this.thueVat = thueVat;
            this.thucThu = thucThu;
        }
    }
}