package com.example.qlnh.repository;

import com.example.qlnh.entity.BanAn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BanAnRepository extends JpaRepository< BanAn, String > {

    List< BanAn > findByTrangThai(String trangThai);

    boolean existsByTenBanIgnoreCase(String tenBan);

    boolean existsByTenBanIgnoreCaseAndMaBanNot(String tenBan, String maBan);
}