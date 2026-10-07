package com.example.qlnh.dto.request;
import lombok.Data;

@Data
public class NhaCungCapRequest {
    private String tenNCC; // Lấy từ input Tên Nhà Cung Cấp
    private String soDienThoai; // Lấy từ input Số Điện Thoại
}