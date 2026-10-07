package com.example.qlnh.service;

import com.example.qlnh.dto.request.KhuyenMaiRequest;
import com.example.qlnh.dto.response.KhuyenMaiResponse;
import java.util.List;

public interface KhuyenMaiService {
    List< KhuyenMaiResponse > layDanhSach();
    KhuyenMaiResponse layChiTiet(String maKM);
    KhuyenMaiResponse taoKhuyenMai(KhuyenMaiRequest request);
    KhuyenMaiResponse capNhatKhuyenMai(String maKM, KhuyenMaiRequest request);
    void xoaKhuyenMai(String maKM);
}