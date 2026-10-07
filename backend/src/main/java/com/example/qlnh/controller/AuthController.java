package com.example.qlnh.controller;

import com.example.qlnh.dto.request.LoginRequest;
import com.example.qlnh.dto.response.LoginResponse;
import com.example.qlnh.entity.TaiKhoan;
import com.example.qlnh.repository.TaiKhoanRepository;
import com.example.qlnh.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> dangNhap(@RequestBody LoginRequest request) {

        // 1. Tìm tài khoản trong Database
        Optional<TaiKhoan> tkOpt = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap());

        if (tkOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Sai tên đăng nhập hoặc mật khẩu!");
        }

        TaiKhoan tk = tkOpt.get();

        // 2. Kiểm tra tài khoản có bị khóa không
        if (tk.getTrangThai() == 0) {
            return ResponseEntity.badRequest().body("Tài khoản của bạn đã bị khóa!");
        }

        // 3. So sánh mật khẩu FE gửi lên với mật khẩu đã băm trong CSDL
        boolean isMatch = passwordEncoder.matches(request.getMatKhau(), tk.getMatKhau());
        if (!isMatch) {
            return ResponseEntity.badRequest().body("Sai tên đăng nhập hoặc mật khẩu!");
        }

        // 4. Nếu đúng hết thì gom thông tin trả về cho Frontend
        LoginResponse response = new LoginResponse();
        response.setMaNV(tk.getMaNV());
        response.setHoTen(tk.getNhanVien().getHoTen());
        response.setVaiTro(tk.getNhanVien().getVaiTro());
        String jwtToken = jwtUtil.generateToken(tk.getTenDangNhap(), tk.getNhanVien().getVaiTro().name(), tk.getMaNV());
        response.setToken(jwtToken);
        response.setYeuCauDoiMatKhau(tk.getYeuCauDoiMatKhau());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/doi-mat-khau-lan-dau")
    public ResponseEntity<?> doiMatKhauLanDau(@RequestBody java.util.Map<String, String> request) {
        String maNV = request.get("maNV");
        String matKhauMoi = request.get("matKhauMoi");
        
        if (maNV == null || matKhauMoi == null || matKhauMoi.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Thiếu thông tin mã nhân viên hoặc mật khẩu mới!");
        }

        try {
            // Lấy Bean TaiKhoanService từ ApplicationContext để gọi hàm
            com.example.qlnh.service.TaiKhoanService taiKhoanService = 
                org.springframework.web.context.support.WebApplicationContextUtils
                .getRequiredWebApplicationContext(
                    ((org.springframework.web.context.request.ServletRequestAttributes) 
                    org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest().getServletContext()
                ).getBean(com.example.qlnh.service.TaiKhoanService.class);
                
            taiKhoanService.doiMatKhauLanDau(maNV, matKhauMoi);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
}