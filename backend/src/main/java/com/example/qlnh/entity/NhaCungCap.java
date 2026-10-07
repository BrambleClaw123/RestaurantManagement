package com.example.qlnh.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nhacungcap")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NhaCungCap {
    @Id
    @Column(length = 50)
    private String maNCC;

    @Column(nullable = false, length = 200)
    private String tenNCC;

    @Column(length = 15)
    private String soDienThoai;
}