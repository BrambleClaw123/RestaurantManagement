package com.example.qlnh.dto.request;

import lombok.Data;

@Data
public class ChotHoaDonRequest {
    private Long maPhieuGM;
    private String maKhuyenMai;

    // TIEN_MAT | CHUYEN_KHOAN | THE (mặc định TIEN_MAT nếu không gửi)
    private String phuongThucThanhToan;
    private Double soTienKhachDua; // Chỉ dùng cho tiền mặt
    private String maGiaoDich;     // Bắt buộc với THE, tùy chọn với CHUYEN_KHOAN
}