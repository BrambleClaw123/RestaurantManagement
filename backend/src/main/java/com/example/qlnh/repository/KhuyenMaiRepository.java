package com.example.qlnh.repository;

import com.example.qlnh.entity.KhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhuyenMaiRepository extends JpaRepository< KhuyenMai, String > {
}