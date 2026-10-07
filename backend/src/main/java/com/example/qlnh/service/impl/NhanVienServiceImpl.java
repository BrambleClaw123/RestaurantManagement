package com.example.qlnh.service.impl;

import com.example.qlnh.converter.NhanVienConverter;
import com.example.qlnh.dto.request.NhanVienRequest;
import com.example.qlnh.dto.response.NhanVienResponse;
import com.example.qlnh.entity.NhanVien;
import com.example.qlnh.repository.NhanVienRepository;
import com.example.qlnh.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NhanVienServiceImpl implements NhanVienService {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private NhanVienConverter nhanVienConverter;

    @Override
    public List<NhanVienResponse> layDanhSachNhanVien(String keyword) {
        List<NhanVien> danhSach;

        // Nếu không có keyword thì lấy tất cả, ngược lại thì gọi hàm tìm kiếm
        if (keyword == null || keyword.trim().isEmpty()) {
            danhSach = nhanVienRepository.findAll();
        } else {
            danhSach = nhanVienRepository.timKiemNhanVien(keyword.trim());
        }

        // Chuyển Entity sang DTO bằng Converter đã viết
        return danhSach.stream()
                .map(nv -> nhanVienConverter.toResponse(nv))
                .collect(Collectors.toList());
    }

    @Override
    public NhanVienResponse themNhanVien(NhanVienRequest request) {
        // Chỉ cần kiểm tra Số điện thoại
        if (nhanVienRepository.existsBySoDienThoai(request.getSoDienThoai())) {
            throw new IllegalArgumentException("Số điện thoại này đã được đăng ký cho nhân viên khác.");
        }

        NhanVien nv = new NhanVien();
        nv.setMaNV("NV" + System.currentTimeMillis());
        nv.setHoTen(request.getHoTen());
        nv.setVaiTro(request.getVaiTro()); // Đã là kiểu Enum VaiTro
        nv.setSoDienThoai(request.getSoDienThoai());

        return nhanVienConverter.toResponse(nhanVienRepository.save(nv));
    }

    @Override
    public NhanVienResponse capNhatNhanVien(String maNV, NhanVienRequest request) {
        NhanVien nvHienTai = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên."));

        if (nhanVienRepository.existsBySoDienThoaiAndMaNVNot(request.getSoDienThoai(), maNV)) {
            throw new IllegalArgumentException("Số điện thoại này đã được đăng ký cho nhân viên khác.");
        }

        nvHienTai.setHoTen(request.getHoTen());
        nvHienTai.setVaiTro(request.getVaiTro());
        nvHienTai.setSoDienThoai(request.getSoDienThoai());

        return nhanVienConverter.toResponse(nhanVienRepository.save(nvHienTai));
    }
}