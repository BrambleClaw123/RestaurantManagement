package com.example.qlnh.repository;

import com.example.qlnh.entity.PhieuDatBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuDatBanRepository extends JpaRepository<PhieuDatBan, Long> {
    // Sắp xếp các phiếu đặt bàn mới nhất hoặc sắp tới lên đầu (Chỉ lấy phiếu đang chờ)
    List<PhieuDatBan> findAllByTrangThaiOrderByNgayGioDatAsc(String trangThai);
    Optional< PhieuDatBan > findFirstByBanAn_MaBanOrderByNgayGioDatDesc(String maBan);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM PhieuDatBan p WHERE p.banAn.maBan = :maBan AND p.ngayGioDat BETWEEN :start AND :end AND p.trangThai = 'Đã đặt'")
    List<PhieuDatBan> findConflicts(@org.springframework.data.repository.query.Param("maBan") String maBan, @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM PhieuDatBan p WHERE p.ngayGioDat <= :cutoffTime AND p.banAn.trangThai = 'Đã đặt' AND p.trangThai = 'Đã đặt'")
    List<PhieuDatBan> findExpiredReservations(@org.springframework.data.repository.query.Param("cutoffTime") java.time.LocalDateTime cutoffTime);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM PhieuDatBan p WHERE p.ngayGioDat >= :now AND p.ngayGioDat <= :lockTime AND p.banAn.trangThai = 'Trống' AND p.trangThai = 'Đã đặt'")
    List<PhieuDatBan> findUpcomingReservationsToLock(@org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now, @org.springframework.data.repository.query.Param("lockTime") java.time.LocalDateTime lockTime);
}