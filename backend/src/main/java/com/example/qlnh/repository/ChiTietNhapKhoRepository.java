package com.example.qlnh.repository;
import com.example.qlnh.entity.ChiTietNhapKho;
import com.example.qlnh.entity.ChiTietNhapKhoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChiTietNhapKhoRepository extends JpaRepository< ChiTietNhapKho, ChiTietNhapKhoId > {

    @Query("SELECT c.nguyenVatLieu.maNVL, SUM(c.soLuong) FROM ChiTietNhapKho c " +
            "WHERE c.phieuNhapKho.ngayLapPhieu >= :tuNgay AND c.phieuNhapKho.ngayLapPhieu <= :denNgay " +
            "GROUP BY c.nguyenVatLieu.maNVL")
    List< Object[] > thongKeNhapTrongKy(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);

    @Query("SELECT SUM(c.soLuong * c.donGia) FROM ChiTietNhapKho c " +
            "WHERE c.phieuNhapKho.ngayLapPhieu >= :tuNgay AND c.phieuNhapKho.ngayLapPhieu <= :denNgay")
    Double tongGiaTriNhapTrongKy(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);

    // Kiểm tra xem NVL này đã từng được nhập kho chưa
    boolean existsByNguyenVatLieu_MaNVL(String maNVL);

    List<ChiTietNhapKho> findByPhieuNhapKho_MaPhieuNK(Long maPhieuNK);
    void deleteByPhieuNhapKho_MaPhieuNK(Long maPhieuNK);
}