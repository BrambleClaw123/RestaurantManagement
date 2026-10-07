package com.example.qlnh.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class KhuyenMaiResponse {
    private String maKM;
    private String tenKM;
    private Double tienGiam;
    private LocalDate ngayKetThuc;
    private String trangThai; // Bổ sung nhẹ 1 trường ảo để báo FE biết mã còn hạn hay không
}