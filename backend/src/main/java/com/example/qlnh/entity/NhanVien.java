package com.example.qlnh.entity;

import com.example.qlnh.enums.VaiTro;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nhanvien")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NhanVien {
    @Id
    @Column(length = 50)
    private String maNV;

    @Column(nullable = false, length = 100)
    private String hoTen;

    @Column(length = 50)
    private VaiTro vaiTro;

    @Column(nullable = false, length = 15, unique = true)
    private String soDienThoai;
}