package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieunhapkho")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PhieuNhapKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maPhieuNK;

    @ManyToOne @JoinColumn(name = "maNV")
    private NhanVien nhanVien;

    @ManyToOne @JoinColumn(name = "maNCC")
    private NhaCungCap nhaCungCap;

    private LocalDateTime ngayLapPhieu = LocalDateTime.now();

    @Column(length = 255)
    private String lyDoNhap;

    private Double tongTienThanhToan = 0.0;
}