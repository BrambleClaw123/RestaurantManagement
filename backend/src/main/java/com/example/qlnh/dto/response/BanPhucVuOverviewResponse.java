package com.example.qlnh.dto.response;

import lombok.Data;

@Data
public class BanPhucVuOverviewResponse {
    private String maBan;
    private String tenBan; // VD: "Bàn 01"
    private String trangThai; // VD: "Trống", "Đã đặt", "Đang phục vụ"

    // Trường này sẽ linh hoạt hiển thị #TB-..., #RES-... hoặc #ORD-...
    private String maPhieuHienThi;
}