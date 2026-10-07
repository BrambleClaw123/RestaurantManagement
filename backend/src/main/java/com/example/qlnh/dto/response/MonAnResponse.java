package com.example.qlnh.dto.response;
import com.example.qlnh.enums.DonViTinh;
import com.example.qlnh.enums.LoaiMon;
import lombok.Data;

@Data
public class MonAnResponse {
    private Long maMon; // Đổi thành Long
    private String tenMon;
    private LoaiMon loaiMon;
    private DonViTinh donViTinh;
    private Double donGia;
    private String trangThai;
}