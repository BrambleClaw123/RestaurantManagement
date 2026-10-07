package com.example.qlnh.repository;

import com.example.qlnh.entity.MonAn;
import com.example.qlnh.enums.LoaiMon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MonAnRepository extends JpaRepository< MonAn, Long > {

    @Query("SELECT m FROM MonAn m WHERE " +
            "(:keyword IS NULL OR LOWER(m.tenMon) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:loaiMon IS NULL OR m.loaiMon = :loaiMon)")
    List< MonAn > timKiemVaLoc(@Param("keyword") String keyword, @Param("loaiMon") LoaiMon loaiMon);

    // Dùng chung 1 hàm này để đếm cho cả "Còn món" và "Hết món"
    long countByTrangThai(String trangThai);

    @Query("SELECT AVG(m.donGia) FROM MonAn m")
    Double tinhDonGiaTrungBinh();

    // Kiểm tra trùng tên món ăn (không phân biệt hoa/thường)
    boolean existsByTenMonIgnoreCase(String tenMon);

    // Hỗ trợ Bếp tìm kiếm nhanh
    List< MonAn > findByTenMonContainingIgnoreCase(String tenMon);

    // Hỗ trợ Phục vụ load danh sách menu "Còn món"
    List< MonAn > findByTrangThai(String trangThai);
}