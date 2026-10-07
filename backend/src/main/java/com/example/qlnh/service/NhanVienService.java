package com.example.qlnh.service;

import com.example.qlnh.dto.request.NhanVienRequest;
import com.example.qlnh.dto.response.NhanVienResponse;

import java.util.List;

public interface NhanVienService {
    NhanVienResponse themNhanVien(NhanVienRequest request);
    NhanVienResponse capNhatNhanVien(String maNV, NhanVienRequest request);
    List<NhanVienResponse> layDanhSachNhanVien(String keyword);
}