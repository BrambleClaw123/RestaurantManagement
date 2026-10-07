package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoadon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maHD;

    @ManyToOne @JoinColumn(name = "maPhieuGM")
    private PhieuGoiMon phieuGoiMon;

    @ManyToOne @JoinColumn(name = "maNV")
    private NhanVien nhanVien;

    @ManyToOne @JoinColumn(name = "maKM") // Khóa ngoại có thể NULL
    private KhuyenMai khuyenMai;

    private LocalDateTime ngayGio = LocalDateTime.now();

    private Double tongTien = 0.0;
    private Double tienKhuyenMai = 0.0;
    private Double thueVAT = 0.0;
    private Double tongThanhToan = 0.0;
}