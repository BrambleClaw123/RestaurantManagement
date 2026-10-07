package com.example.qlnh.converter;

import com.example.qlnh.dto.response.NhanVienResponse;
import com.example.qlnh.entity.NhanVien;
import com.example.qlnh.entity.TaiKhoan;
import com.example.qlnh.repository.TaiKhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class NhanVienConverter {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    public NhanVienResponse toResponse(NhanVien nv) {
        if (nv == null) return null;

        NhanVienResponse response = new NhanVienResponse();
        response.setMaNV(nv.getMaNV());
        response.setHoTen(nv.getHoTen());
        response.setVaiTro(nv.getVaiTro());
        response.setSoDienThoai(nv.getSoDienThoai());

        // Truy xuất tên đăng nhập dựa trên maNV
        Optional<TaiKhoan> tkOpt = taiKhoanRepository.findById(nv.getMaNV());

        if (tkOpt.isPresent()) {
            response.setTaiKhoanLienKet(tkOpt.get().getTenDangNhap());
        } else {
            response.setTaiKhoanLienKet(null); // Trả về null nếu nhân viên chưa được cấp tài khoản
        }

        return response;
    }
}