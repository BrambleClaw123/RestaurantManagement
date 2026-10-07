package com.example.qlnh.service;

import com.example.qlnh.dto.response.BepOrderResponse;
import com.example.qlnh.dto.response.TrangThaiMonResponse;

import java.util.List;

public interface BepService {
    List< BepOrderResponse > layDanhSachOrder();
    void hoanTatOrder(Long maPhieuGM);
    List< TrangThaiMonResponse > layDanhSachThucDon(String keyword);
    void capNhatTrangThaiMon(Long maMon, Boolean conMon);
}