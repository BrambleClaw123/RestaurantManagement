package com.example.qlnh.entity;

import java.io.Serializable;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ChiTietNhapKhoId implements Serializable {
    private Long phieuNhapKho;
    private String nguyenVatLieu;
}