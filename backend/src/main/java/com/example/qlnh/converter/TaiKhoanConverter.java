package com.example.qlnh.converter;

import com.example.qlnh.dto.response.TaiKhoanResponse;
import com.example.qlnh.entity.TaiKhoan;
import org.springframework.stereotype.Component;

@Component // Báo cho Spring Boot quản lý class này để lát nữa dùng @Autowired gọi nó
public class TaiKhoanConverter {

    public TaiKhoanResponse toResponse(TaiKhoan tk) {
        if (tk == null) return null;

        TaiKhoanResponse response = new TaiKhoanResponse();
        response.setMaNV(tk.getMaNV());
        response.setTenDangNhap(tk.getTenDangNhap());
        response.setMatKhau(tk.getMatKhau());

        // Tránh lỗi NullPointerException nếu chẳng may mất kết nối khóa ngoại
        if (tk.getNhanVien() != null) {
            response.setHoTenNhanVien(tk.getNhanVien().getHoTen());
            response.setVaiTro(tk.getNhanVien().getVaiTro());
        }

        response.setTrangThai(tk.getTrangThai());
        return response;
    }
}