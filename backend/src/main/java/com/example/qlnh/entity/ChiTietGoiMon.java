package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chitietgoimon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChiTietGoiMon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "maPhieuGM")
    private PhieuGoiMon phieuGoiMon;

    @ManyToOne @JoinColumn(name = "maMon")
    private MonAn monAn;

    private Integer soLuong;
    private Double donGia;

    @Column(length = 50)
    private String trangThaiBep = "Chờ chế biến";

    @Column(length = 255)
    private String ghiChu;
}