package com.example.qlnh.entity;

import com.example.qlnh.enums.DonViTinh;
import com.example.qlnh.enums.LoaiMon;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MonAn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maMon;

    @Column(nullable = false, length = 150)
    private String tenMon;

    @Column(nullable = false, length = 100)
    private LoaiMon loaiMon;

    @Column(nullable = false, length = 20)
    private DonViTinh donViTinh;

    @Column(nullable = false)
    private Double donGia;

    @Column(length = 50)
    private String trangThai = "Còn món";
}