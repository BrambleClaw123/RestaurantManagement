package com.example.qlnh.repository;

import com.example.qlnh.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    // Kiểm tra trùng SDT khi Thêm mới
    boolean existsBySoDienThoai(String soDienThoai);

    // Kiểm tra trùng SDT khi Cập nhật (bỏ qua chính nhân viên đang sửa)
    boolean existsBySoDienThoaiAndMaNVNot(String soDienThoai, String maNV);

    @Query("SELECT nv FROM NhanVien nv WHERE " +
            "LOWER(nv.maNV) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(nv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(nv.soDienThoai) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(CAST(nv.vaiTro AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<NhanVien> timKiemNhanVien(@Param("keyword") String keyword);
}