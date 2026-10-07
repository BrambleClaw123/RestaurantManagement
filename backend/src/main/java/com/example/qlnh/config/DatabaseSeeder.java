package com.example.qlnh.config;

import com.example.qlnh.entity.NhanVien;
import com.example.qlnh.entity.TaiKhoan;
import com.example.qlnh.enums.VaiTro;
import com.example.qlnh.repository.NhanVienRepository;
import com.example.qlnh.repository.TaiKhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component // Đánh dấu để Spring Boot tự động tìm thấy và chạy class này
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Kiểm tra xem tài khoản "admin" đã tồn tại trong DB chưa
        if (!taiKhoanRepository.existsByTenDangNhap("admin")) {

            // 1. Tạo hồ sơ Nhân viên quyền cao nhất (Người quản lý)
            NhanVien adminNV = new NhanVien();
            adminNV.setMaNV("ADMIN01");
            adminNV.setHoTen("Quản Trị Hệ Thống");
            adminNV.setVaiTro(VaiTro.ADMIN);
            adminNV.setSoDienThoai("0999999999");

            nhanVienRepository.save(adminNV);

            // 2. Tạo tài khoản đăng nhập gắn với nhân viên đó
            TaiKhoan adminTK = new TaiKhoan();
            adminTK.setNhanVien(adminNV);
            adminTK.setTenDangNhap("admin");

            // Băm mật khẩu mặc định là "admin123"
            adminTK.setMatKhau(passwordEncoder.encode("admin123"));
            adminTK.setTrangThai(1);

            taiKhoanRepository.save(adminTK);

            System.out.println("========== HỆ THỐNG ĐÃ TẠO TÀI KHOẢN MẶC ĐỊNH ==========");
            System.out.println("Tên đăng nhập: admin");
            System.out.println("Mật khẩu: admin123");
            System.out.println("========================================================");
        }
    }
}