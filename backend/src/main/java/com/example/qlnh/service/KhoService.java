package com.example.qlnh.service;

import com.example.qlnh.dto.request.NguyenVatLieuRequest;
import com.example.qlnh.dto.request.TaoPhieuNhapRequest;
import com.example.qlnh.dto.response.*;

import java.time.LocalDate;
import java.util.List;

public interface KhoService {
    KhoThongKeResponse layThongKe();
    List< NguyenVatLieuResponse > layDanhSachNVL(String keyword);
    List<NhaCungCapResponse> layDanhSachNhaCungCap();
    NhaCungCapResponse themNhaCungCap(java.util.Map<String, String> request);
    String taoPhieuNhapKho(TaoPhieuNhapRequest request);
    List<PhieuNhapKhoResponse> layDanhSachPhieuNhap(String keyword);
    BaoCaoKhoResponse layBaoCaoKho(LocalDate tuNgay, LocalDate denNgay);
    NguyenVatLieuResponse themNguyenVatLieu(NguyenVatLieuRequest request);
    NguyenVatLieuResponse suaNguyenVatLieu(String maNVL, NguyenVatLieuRequest request);
    void xoaNguyenVatLieu(String maNVL);
    
    PhieuNhapChiTietResponse layChiTietPhieuNhap(Long id);
    String suaPhieuNhap(Long id, TaoPhieuNhapRequest request);
    void xoaPhieuNhap(Long id);
}