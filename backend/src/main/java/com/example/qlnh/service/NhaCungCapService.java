package com.example.qlnh.service;

import com.example.qlnh.dto.request.NhaCungCapRequest;
import com.example.qlnh.dto.response.NhaCungCapResponse;
import com.example.qlnh.dto.response.ThongKeNccResponse;

import java.util.List;

public interface NhaCungCapService {
    List<NhaCungCapResponse> layDanhSach(String keyword);
    ThongKeNccResponse layThongKe();
    NhaCungCapResponse layChiTiet(String maNCC);
    NhaCungCapResponse themNhaCungCap(NhaCungCapRequest request);
    NhaCungCapResponse capNhatNhaCungCap(String maNCC, NhaCungCapRequest request);
}
