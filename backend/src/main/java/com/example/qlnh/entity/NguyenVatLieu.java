package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nguyenvatlieu")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NguyenVatLieu {
    @Id
    @Column(length = 50)
    private String maNVL;

    @Column(nullable = false, length = 150)
    private String tenNVL;

    @Column(nullable = false, length = 20)
    private String donVi;

    private Double soLuongTon = 0.0;

    @Column(length = 50)
    private String trangThai = "Còn hàng";
}