package com.example.qlnh.repository;

import com.example.qlnh.entity.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

// JpaRepository<NhaCungCap, String> thay vì Long
@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, String> {

    @Query("SELECT n FROM NhaCungCap n WHERE " +
            ":keyword IS NULL OR " +
            "LOWER(n.tenNCC) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.soDienThoai) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<NhaCungCap> timKiemNhaCungCap(@Param("keyword") String keyword);
    // Kiểm tra trùng tên nhà cung cấp (không phân biệt hoa/thường)
    boolean existsByTenNCCIgnoreCase(String tenNCC);
    // Kiểm tra trùng số điện thoại
    boolean existsBySoDienThoai(String soDienThoai);
    // Kiểm tra trùng tên nhưng bỏ qua mã NCC hiện tại đang sửa
    boolean existsByTenNCCIgnoreCaseAndMaNCCNot(String tenNCC, String maNCC);

    // Kiểm tra trùng số điện thoại nhưng bỏ qua mã NCC hiện tại đang sửa
    boolean existsBySoDienThoaiAndMaNCCNot(String soDienThoai, String maNCC);
}