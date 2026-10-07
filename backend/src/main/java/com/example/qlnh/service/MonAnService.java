package com.example.qlnh.service;

import com.example.qlnh.dto.request.MonAnRequest;
import com.example.qlnh.dto.response.MonAnResponse;
import com.example.qlnh.dto.response.ThongKeMonAnResponse;

import java.util.List;

public interface MonAnService {
    List<MonAnResponse> layDanhSach(String keyword, String loaiMon);
    ThongKeMonAnResponse layThongKe();
    MonAnResponse layChiTiet(Long maMon);
    MonAnResponse capNhatMonAn(Long maMon, MonAnRequest request);
    MonAnResponse themMonAn(MonAnRequest request);
}
