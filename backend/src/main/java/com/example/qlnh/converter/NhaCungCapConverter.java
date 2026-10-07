package com.example.qlnh.converter;
import com.example.qlnh.dto.response.NhaCungCapResponse;
import com.example.qlnh.entity.NhaCungCap;
import org.springframework.stereotype.Component;

@Component
public class NhaCungCapConverter {
    public NhaCungCapResponse toResponse(NhaCungCap ncc) {
        if (ncc == null) return null;
        NhaCungCapResponse res = new NhaCungCapResponse();
        res.setMaNCC(ncc.getMaNCC());
        res.setTenNCC(ncc.getTenNCC());
        res.setSoDienThoai(ncc.getSoDienThoai());
        return res;
    }
}