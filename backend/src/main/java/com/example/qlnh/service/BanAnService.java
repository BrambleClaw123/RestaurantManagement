package com.example.qlnh.service;

import com.example.qlnh.dto.request.BanAnRequest;
import com.example.qlnh.dto.response.BanAnDropdownResponse;
import com.example.qlnh.dto.response.BanAnResponse;
import java.util.List;

public interface BanAnService {
    List< BanAnDropdownResponse > layDanhSachBanTrong();
    List< BanAnResponse > layTatCaBan();
    BanAnResponse layChiTietBan(String maBan);
    BanAnResponse themBanAn(BanAnRequest request);
    BanAnResponse capNhatBanAn(String maBan, BanAnRequest request);
    void xoaBanAn(String maBan);
}