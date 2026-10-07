package com.example.qlnh.repository;

import com.example.qlnh.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Long> {
    Optional<KhachHang> findBySoDienThoai(String soDienThoai);
}