package com.example.qlnh.repository;

import com.example.qlnh.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {
    boolean existsByTenDangNhap(String tenDangNhap);

    @Query("SELECT t FROM TaiKhoan t WHERE " +
            "LOWER(t.tenDangNhap) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.nhanVien.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(CAST(t.nhanVien.vaiTro AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<TaiKhoan> timKiemTaiKhoan(@Param("keyword") String keyword);
    boolean existsByTenDangNhapAndMaNVNot(String tenDangNhap, String maNV);
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);
}