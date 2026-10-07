package com.example.qlnh.dto.request;
import com.example.qlnh.enums.DonViTinh;
import com.example.qlnh.enums.LoaiMon;
import lombok.Data;

@Data
public class MonAnRequest {
    private String tenMon;
    private LoaiMon loaiMon;
    private DonViTinh donViTinh;
    private Double donGia;
    private String trangThai; // Nhận chuỗi "Còn phục vụ" hoặc "Ngưng phục vụ" từ giao diện
}