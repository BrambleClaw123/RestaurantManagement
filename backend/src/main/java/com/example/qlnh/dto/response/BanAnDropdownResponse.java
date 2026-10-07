package com.example.qlnh.dto.response;
import lombok.Data;

@Data
public class BanAnDropdownResponse {
    private String maBan;
    private String nhanHienThi; // Label để hiển thị trên UI: "Bàn 01 (Trống - 4 chỗ)"
}