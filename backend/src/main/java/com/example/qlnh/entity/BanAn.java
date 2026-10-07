package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BanAn {
    @Id
    @Column(length = 20)
    private String maBan; // VD: B01

    @Column(nullable = false, length = 50)
    private String tenBan; // VD: Bàn 01

    @Column(nullable = false)
    private Integer soCho; // Bổ sung số chỗ ngồi (VD: 2, 4, 6)

    @Column(length = 50)
    private String trangThai = "Trống";
}