package com.example.qlnh.converter;
import com.example.qlnh.dto.response.MonAnResponse;
import com.example.qlnh.entity.MonAn;
import org.springframework.stereotype.Component;

@Component
public class MonAnConverter {
    public MonAnResponse toResponse(MonAn mon) {
        if (mon == null) return null;
        MonAnResponse res = new MonAnResponse();
        res.setMaMon(mon.getMaMon());
        res.setTenMon(mon.getTenMon()); // Gọi đúng tên trường
        res.setLoaiMon(mon.getLoaiMon());
        res.setDonViTinh(mon.getDonViTinh());
        res.setDonGia(mon.getDonGia());
        res.setTrangThai(mon.getTrangThai());
        return res;
    }
}