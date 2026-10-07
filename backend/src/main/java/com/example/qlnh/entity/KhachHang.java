package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "khachhang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class KhachHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maKH;

    @Column(nullable = false, length = 100)
    private String hoTen;

    @Column(nullable = false, length = 15, unique = true)
    private String soDienThoai;
}