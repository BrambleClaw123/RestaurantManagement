package com.example.qlnh.service;

import com.example.qlnh.dto.request.TaiKhoanRequest;
import com.example.qlnh.dto.response.TaiKhoanResponse;
import com.example.qlnh.entity.TaiKhoan;
import java.util.List;

public interface TaiKhoanService {

    // Cập nhật: Trả về TaiKhoanResponse và nhận keyword
    List<TaiKhoanResponse> layDanhSachTaiKhoan(String keyword);

    java.util.Map<String, Object> themTaiKhoan(TaiKhoanRequest request);

    // Hàm cho nút "Sửa"
    TaiKhoanResponse capNhatTaiKhoan(String maNV, TaiKhoanRequest request);

    // Hàm cho nút "Khóa" / "Mở khóa" ngoài bảng
    TaiKhoanResponse thayDoiTrangThai(String maNV);

    // Hàm cho nút "Đặt lại mật khẩu"
    String datLaiMatKhau(String maNV);

    // Hàm cho người dùng tự đổi mật khẩu khi bị yêu cầu
    void doiMatKhauLanDau(String maNV, String matKhauMoi);
}