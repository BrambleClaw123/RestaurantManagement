package com.example.qlnh.service;

import com.example.qlnh.dto.request.PhieuDatBanRequest;
import com.example.qlnh.dto.response.PhieuDatBanResponse;

import java.util.List;

public interface PhieuDatBanService {
    List<PhieuDatBanResponse> layDanhSach();
    PhieuDatBanResponse layChiTiet(Long id);
    PhieuDatBanResponse taoPhieuDatBan(PhieuDatBanRequest request);
    PhieuDatBanResponse capNhatPhieu(Long id, PhieuDatBanRequest request);
    public void xoaPhieu(Long id);
    PhieuDatBanResponse xacNhanDenQuan(Long id);
}
