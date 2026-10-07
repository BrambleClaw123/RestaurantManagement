package com.example.qlnh.service;

import com.example.qlnh.dto.request.ChotHoaDonRequest;
import com.example.qlnh.dto.response.ChiTietThanhToanResponse;
import com.example.qlnh.dto.response.DanhSachBanPhucVuResponse;
import java.util.List;

public interface ThanhToanService {
    List< DanhSachBanPhucVuResponse > layDanhSachBanDangPhucVu(String keyword);
    ChiTietThanhToanResponse layChiTietThanhToan(Long maPhieuGM);
    String chotHoaDon(ChotHoaDonRequest request);
    public ChiTietThanhToanResponse apDungKhuyenMai(Long maPhieuGM, String maKM);
}