package com.example.qlnh.enums;

public enum VaiTro {
    DAU_BEP("Đầu bếp"),
    PHUC_VU("Nhân viên phục vụ"),
    LE_TAN("Lễ tân"),
    NHAN_VIEN_KHO("Nhân viên kho"),
    QUAN_LY("Người quản lý"),
    ADMIN("Người quản trị");

    private final String giaTri;

    VaiTro(String giaTri) {
        this.giaTri = giaTri;
    }

    // Dùng cho VaiTroDbConverter để lưu chữ tiếng Việt đẹp đẽ xuống MySQL
    public String getGiaTri() {
        return giaTri;
    }
}