package com.example.qlnh.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KhoThongKeResponse {
    private long tongMatHang;
    private long conHangOnDinh;
    private long sapHetHang;
    private long daHetHang;
}