package com.example.qlnh.repository;

import com.example.qlnh.entity.HoaDon;
import com.example.qlnh.entity.PhieuNhapKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhieuNhapKhoRepository extends JpaRepository<PhieuNhapKho, Long> {
    // Tính tổng tiền nhập kho trong kỳ
    @Query("SELECT COALESCE(SUM(p.tongTienThanhToan), 0.0) FROM PhieuNhapKho p WHERE p.ngayLapPhieu BETWEEN :tuNgay AND :denNgay")
    Double tinhTongTienNhapKho(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);
    @Query("SELECT p FROM PhieuNhapKho p " +
            "LEFT JOIN p.nhaCungCap ncc " +
            "LEFT JOIN p.nhanVien nv " +
            "WHERE (:keyword IS NULL OR " +
            "CAST(p.maPhieuNK AS string) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(ncc.tenNCC) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(nv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY p.ngayLapPhieu DESC")
    List< PhieuNhapKho > timKiemPhieuNhap(@Param("keyword") String keyword);
}
