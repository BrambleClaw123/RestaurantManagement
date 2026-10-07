package com.example.qlnh.dto.request;

import lombok.Data;

@Data
public class NguyenVatLieuRequest {
    private String tenNVL; // Lấy từ ô "Tên nguyên vật liệu"
    private String donVi;  // Lấy từ dropdown "Đơn vị"
}