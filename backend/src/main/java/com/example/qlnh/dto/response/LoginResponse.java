package com.example.qlnh.dto.response;
import com.example.qlnh.enums.VaiTro;
import lombok.Data;

@Data
public class LoginResponse {
    private String maNV;
    private String hoTen;
    private VaiTro vaiTro;
    private String token; // Tạm thời để trống, bước sau tích hợp JWT sẽ dùng tới
    private Boolean yeuCauDoiMatKhau;
}