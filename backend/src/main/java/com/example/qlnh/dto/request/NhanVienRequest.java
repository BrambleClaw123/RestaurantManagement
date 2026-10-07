package com.example.qlnh.dto.request;

import com.example.qlnh.enums.VaiTro;
import lombok.Data;

@Data
public class NhanVienRequest {
    private String hoTen;
    private VaiTro vaiTro;
    private String soDienThoai;
}