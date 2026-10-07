package com.example.qlnh.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PhieuNhapChiTietResponse {
    private Long id;
    private String maPhieu;
    private LocalDateTime ngayNhap;
    private String supplier; // maNCC
    private String supplierName; // tenNCC
    private String nguoiLap;
    private String reason; // lyDoNhap
    private Double total;
    private List<ChiTietRow> rows;

    @Data
    public static class ChiTietRow {
        private Long id; // mock id cho UI
        private String matName;
        private String unit;
        private Double quantity;
        private Double price;
    }
}
