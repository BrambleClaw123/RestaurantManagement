package com.example.qlnh.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietMonResponse {
    private String tenMon;
    private Integer soLuong;
    private Double donGia;
    private Double thanhTien; // soLuong * donGia
}