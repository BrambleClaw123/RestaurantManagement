package com.example.qlnh.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class KhuyenMaiRequest {
    private String maKM; // Dùng để client tự định nghĩa mã (VD: TET2026, GIAM50K)
    private String tenKM;
    private Double tienGiam;
    private LocalDate ngayKetThuc;
}