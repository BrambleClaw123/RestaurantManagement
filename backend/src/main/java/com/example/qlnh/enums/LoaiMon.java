package com.example.qlnh.enums;

public enum LoaiMon {
    MON_CHINH("Món chính"),
    LAU_NUONG("Lẩu & Nướng"),
    MON_KHAI_VI("Món khai vị"),
    TRANG_MIENG("Tráng miệng"),
    THUC_UONG("Thức uống");

    private final String giaTri;

    LoaiMon(String giaTri) {
        this.giaTri = giaTri;
    }

    public String getGiaTri() {
        return giaTri;
    }
}