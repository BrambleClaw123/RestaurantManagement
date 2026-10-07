package com.example.qlnh.repository;

import com.example.qlnh.entity.PhieuGoiMon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuGoiMonRepository extends JpaRepository< PhieuGoiMon, Long > {
    // Lấy danh sách các phiếu chưa thanh toán (tương ứng với các bàn đang phục vụ)
    Optional< PhieuGoiMon > findFirstByBanAn_MaBanOrderByThoiGianLapDesc(String maBan);
    // Lấy các phiếu gọi món mà có ít nhất 1 món chưa nấu xong (FIFO)
    @Query("SELECT DISTINCT p FROM PhieuGoiMon p JOIN ChiTietGoiMon c ON p.maPhieuGM = c.phieuGoiMon.maPhieuGM WHERE c.trangThaiBep <> 'Đã xong' ORDER BY p.thoiGianLap ASC")
    List< PhieuGoiMon > findPhieuGoiMonChuaXong();
}