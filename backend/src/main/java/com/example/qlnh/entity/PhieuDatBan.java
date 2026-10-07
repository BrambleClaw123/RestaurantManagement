package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieudatban")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PhieuDatBan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maPhieuDB;

    @ManyToOne @JoinColumn(name = "maKH")
    private KhachHang khachHang;

    @ManyToOne @JoinColumn(name = "maNV")
    private NhanVien nhanVien;

    @ManyToOne @JoinColumn(name = "maBan")
    private BanAn banAn;

    private LocalDateTime ngayLapPhieu = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime ngayGioDat;

    private Integer soNguoiLon = 0;
    private Integer soTreEm = 0;

    @Column(columnDefinition = "TEXT")
    private String yeuCau;
    
    @Column(length = 50)
    private String trangThai = "Đã đặt"; // Các trạng thái: Đã đặt, Đã đến quán, Đã hủy
}