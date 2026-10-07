package com.example.qlnh.repository;

import com.example.qlnh.dto.response.baocao.BaoCaoTonKhoResponse;
import com.example.qlnh.entity.HoaDon;
import com.example.qlnh.entity.NguyenVatLieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface NguyenVatLieuRepository extends JpaRepository<NguyenVatLieu, String>  {
    // Lấy tồn kho và tổng lượng nhập trong kỳ (Dùng LEFT JOIN để lấy cả NL chưa nhập trong kỳ)
    @Query("SELECT new com.example.qlnh.dto.response.baocao.BaoCaoTonKhoResponse$ChiTiet(" +
            "n.maNVL, n.tenNVL, n.donVi, n.soLuongTon, COALESCE(SUM(c.soLuong), 0.0)) " +
            "FROM NguyenVatLieu n LEFT JOIN ChiTietNhapKho c ON n.maNVL = c.nguyenVatLieu.maNVL " +
            "LEFT JOIN c.phieuNhapKho p ON (p.ngayLapPhieu BETWEEN :tuNgay AND :denNgay) " +
            "GROUP BY n.maNVL, n.tenNVL, n.donVi, n.soLuongTon " +
            "ORDER BY n.soLuongTon ASC")
    List<BaoCaoTonKhoResponse.ChiTiet> layChiTietTonKho(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);

    // Đếm số nguyên vật liệu sắp hết (Ví dụ < 10)
    @Query("SELECT COUNT(n) FROM NguyenVatLieu n WHERE n.soLuongTon < 10")
    long countNguyenVatLieuSapHet();

    @Query("SELECT n FROM NguyenVatLieu n WHERE " +
            "(:keyword IS NULL OR LOWER(n.maNVL) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.tenNVL) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List< NguyenVatLieu > timKiem(@Param("keyword") String keyword);

    // Đếm số lượng theo trạng thái cực nhanh
    long countByTrangThai(String trangThai);
    // Kiểm tra xem tên nguyên vật liệu đã tồn tại chưa (bỏ qua hoa/thường)
    boolean existsByTenNVLIgnoreCase(String tenNVL);
}
