package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieugoimon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PhieuGoiMon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maPhieuGM;

    @ManyToOne @JoinColumn(name = "maBan")
    private BanAn banAn;

    @ManyToOne @JoinColumn(name = "maNV")
    private NhanVien nhanVien;

    private LocalDateTime thoiGianLap = LocalDateTime.now();
    private LocalDateTime thoiGianSua = LocalDateTime.now();
}