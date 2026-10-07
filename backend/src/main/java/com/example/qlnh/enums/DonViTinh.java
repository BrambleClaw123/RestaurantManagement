package com.example.qlnh.enums;

public enum DonViTinh {
    DIA("Đĩa"),
    PHAN("Phần"),
    NOI("Nồi"),
    LY("Ly");

    private final String giaTri;

    DonViTinh(String giaTri) {
        this.giaTri = giaTri;
    }

    public String getGiaTri() {
        return giaTri;
    }
}