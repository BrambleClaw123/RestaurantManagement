package com.example.qlnh.dto.response;

import com.example.qlnh.enums.VaiTro;
import lombok.Data;

@Data
public class NhanVienResponse {
    private String maNV;
    private String hoTen;
    private VaiTro vaiTro;
    private String soDienThoai;
    private String taiKhoanLienKet;
}