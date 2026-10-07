package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "khuyenmai")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class KhuyenMai {
    @Id
    @Column(length = 50)
    private String maKM;

    @Column(nullable = false, length = 255)
    private String tenKM;

    private Double tienGiam = 0.0;

    private LocalDate ngayKetThuc;
}