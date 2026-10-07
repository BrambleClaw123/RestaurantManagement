package com.example.qlnh.repository;

import com.example.qlnh.dto.response.baocao.BaoCaoDoanhThuResponse;
import com.example.qlnh.entity.HoaDon;
import com.example.qlnh.entity.MonAn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    @Query("SELECT new com.example.qlnh.dto.response.baocao.BaoCaoDoanhThuResponse$ChiTiet(" +
            "CAST(h.ngayGio AS date), COUNT(h.maHD), SUM(h.tongTien), SUM(h.thueVAT), SUM(h.tongThanhToan)) " +
            "FROM HoaDon h WHERE h.ngayGio BETWEEN :tuNgay AND :denNgay " +
            "GROUP BY CAST(h.ngayGio AS date) ORDER BY CAST(h.ngayGio AS date) ASC")
    List<BaoCaoDoanhThuResponse.ChiTiet> layChiTietDoanhThu(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);
    boolean existsByPhieuGoiMon_MaPhieuGM(Long maPhieuGM);
}
