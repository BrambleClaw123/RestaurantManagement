package com.example.qlnh.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder // Dùng Builder để lát nữa gán dữ liệu cho lẹ
public class ThongKeMonAnResponse {
    private long tongSoMon;
    private long soMonConPhucVu;
    private long soMonTamNgung;
    private Double donGiaTrungBinh;
}