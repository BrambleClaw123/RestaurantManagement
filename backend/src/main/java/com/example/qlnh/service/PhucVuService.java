package com.example.qlnh.service;

import com.example.qlnh.dto.request.ThemMonRequest;
import com.example.qlnh.dto.response.BanPhucVuOverviewResponse;
import com.example.qlnh.dto.response.ChiTietBanPhucVuResponse;
import com.example.qlnh.dto.response.ThucDonPhucVuResponse;

import java.util.List;

public interface PhucVuService {
    List< BanPhucVuOverviewResponse > layDanhSachBanTongQuan();
    ChiTietBanPhucVuResponse layChiTietBan(String maBan);
    String moBan(String maBan, String maNV);
    List<ThucDonPhucVuResponse> layThucDon();
    void themMonVaoBan(Long maPhieuGM, ThemMonRequest request);
    void suaSoLuongMon(Long id, Integer soLuongMoi);
    void xoaMonAn(Long id);
}