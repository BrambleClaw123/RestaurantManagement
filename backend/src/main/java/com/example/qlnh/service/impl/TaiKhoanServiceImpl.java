package com.example.qlnh.service.impl;

import com.example.qlnh.converter.TaiKhoanConverter;
import com.example.qlnh.dto.request.TaiKhoanRequest;
import com.example.qlnh.dto.response.TaiKhoanResponse;
import com.example.qlnh.entity.NhanVien;
import com.example.qlnh.entity.TaiKhoan;
import com.example.qlnh.repository.NhanVienRepository;
import com.example.qlnh.repository.TaiKhoanRepository;
import com.example.qlnh.service.TaiKhoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service // Annotation bắt buộc để Spring Boot biết đây là Service
public class TaiKhoanServiceImpl implements TaiKhoanService {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private TaiKhoanConverter taiKhoanConverter;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public java.util.Map<String, Object> themTaiKhoan(TaiKhoanRequest request) {
        // 1. Kiểm tra nhân viên có tồn tại không
        Optional<NhanVien> nhanVienOpt = nhanVienRepository.findById(request.getMaNV());
        if (nhanVienOpt.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy nhân viên này trong hệ thống.");
        }

        // 2. Kiểm tra nhân viên này đã có tài khoản chưa
        if (taiKhoanRepository.existsById(request.getMaNV())) {
            throw new IllegalArgumentException("Nhân viên này đã được cấp tài khoản.");
        }

        // 3. Kiểm tra tên đăng nhập có bị trùng không
        if (taiKhoanRepository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new IllegalArgumentException("Tên đăng nhập này đã tồn tại.");
        }

        // Sinh mật khẩu ngẫu nhiên
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        String matKhauMoi = sb.toString();

        // 4. Gán dữ liệu và lưu
        NhanVien nv = nhanVienOpt.get();
        TaiKhoan tkMoi = new TaiKhoan();

        tkMoi.setNhanVien(nv);
        tkMoi.setTenDangNhap(request.getTenDangNhap());
        tkMoi.setMatKhau(passwordEncoder.encode(matKhauMoi));
        tkMoi.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : 1);
        tkMoi.setYeuCauDoiMatKhau(true);

        TaiKhoan saved = taiKhoanRepository.save(tkMoi);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("taiKhoan", saved);
        response.put("matKhauMoi", matKhauMoi);
        return response;
    }

    @Override
    public List<TaiKhoanResponse> layDanhSachTaiKhoan(String keyword) {
        List<TaiKhoan> danhSachTk;
        if (keyword == null || keyword.trim().isEmpty()) {
            danhSachTk = taiKhoanRepository.findAll();
        } else {
            danhSachTk = taiKhoanRepository.timKiemTaiKhoan(keyword.trim());
        }

        // 2. Sử dụng converter trong biểu thức Lambda
        return danhSachTk.stream()
                .map(tk -> taiKhoanConverter.toResponse(tk))
                .collect(Collectors.toList());
    }

    @Override
    public TaiKhoanResponse capNhatTaiKhoan(String maNV, TaiKhoanRequest request) {
        TaiKhoan tkHienTai = taiKhoanRepository.findById(maNV)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));

        if (taiKhoanRepository.existsByTenDangNhapAndMaNVNot(request.getTenDangNhap(), maNV)) {
            throw new IllegalArgumentException("Tên đăng nhập đã bị sử dụng.");
        }

        tkHienTai.setTenDangNhap(request.getTenDangNhap());

        if (request.getTrangThai() != null) {
            tkHienTai.setTrangThai(request.getTrangThai());
        }

        TaiKhoan updated = taiKhoanRepository.save(tkHienTai);

        // 3. Sử dụng converter để trả về
        return taiKhoanConverter.toResponse(updated);
    }

    @Override
    public TaiKhoanResponse thayDoiTrangThai(String maNV) {
        TaiKhoan tkHienTai = taiKhoanRepository.findById(maNV)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));

        tkHienTai.setTrangThai(tkHienTai.getTrangThai() == 1 ? 0 : 1);
        TaiKhoan updated = taiKhoanRepository.save(tkHienTai);

        // 4. Sử dụng converter để trả về
        return taiKhoanConverter.toResponse(updated);
    }

    @Override
    public String datLaiMatKhau(String maNV) {
        TaiKhoan tkHienTai = taiKhoanRepository.findById(maNV)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));
        
        // Sinh mật khẩu ngẫu nhiên 8 ký tự
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        String matKhauMoi = sb.toString();
        
        tkHienTai.setMatKhau(passwordEncoder.encode(matKhauMoi));
        tkHienTai.setYeuCauDoiMatKhau(true);
        taiKhoanRepository.save(tkHienTai);
        
        return matKhauMoi;
    }

    @Override
    public void doiMatKhauLanDau(String maNV, String matKhauMoi) {
        TaiKhoan tkHienTai = taiKhoanRepository.findById(maNV)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));
                
        tkHienTai.setMatKhau(passwordEncoder.encode(matKhauMoi));
        tkHienTai.setYeuCauDoiMatKhau(false);
        taiKhoanRepository.save(tkHienTai);
    }
}