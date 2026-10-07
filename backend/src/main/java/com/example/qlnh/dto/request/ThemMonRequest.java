package com.example.qlnh.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class ThemMonRequest {
    private List< MonDuocChon > danhSachMon;

    @Data
    public static class MonDuocChon {
        private Long maMon;
        private Integer soLuong;
        private String ghiChu;
    }
}