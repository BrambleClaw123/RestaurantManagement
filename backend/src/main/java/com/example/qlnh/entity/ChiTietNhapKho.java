package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chitietnhapkho")
@IdClass(ChiTietNhapKhoId.class) // Khai báo dùng khóa kép
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChiTietNhapKho {

    @Id
    @ManyToOne @JoinColumn(name = "maPhieuNK")
    private PhieuNhapKho phieuNhapKho;

    @Id
    @ManyToOne @JoinColumn(name = "maNVL")
    private NguyenVatLieu nguyenVatLieu;

    private Double soLuong;
    private Double donGia;
}