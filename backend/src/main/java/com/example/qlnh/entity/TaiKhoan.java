package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "taikhoan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TaiKhoan {
    @Id
    private String maNV; // Khóa chính đồng thời là khóa ngoại

    @OneToOne
    @MapsId // Báo cho JPA biết dùng maNV làm khóa ngoại nối với NhanVien
    @JoinColumn(name = "maNV")
    private NhanVien nhanVien;

    @Column(nullable = false, length = 50, unique = true)
    private String tenDangNhap;

    @Column(nullable = false, length = 255)
    private String matKhau;

    private Integer trangThai = 1; // 1: Hoạt động, 0: Khóa

    @Column(name = "yeu_cau_doi_mat_khau", nullable = false)
    private Boolean yeuCauDoiMatKhau = false;
}