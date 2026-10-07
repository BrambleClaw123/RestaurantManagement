package com.example.qlnh.service;

import com.example.qlnh.dto.response.baocao.BaoCaoBanChayResponse;
import com.example.qlnh.dto.response.baocao.BaoCaoDoanhThuResponse;
import com.example.qlnh.dto.response.baocao.BaoCaoTonKhoResponse;

import java.time.LocalDateTime;

public interface BaoCaoService {
    BaoCaoDoanhThuResponse layBaoCaoDoanhThu(LocalDateTime tuNgay, LocalDateTime denNgay);
    BaoCaoBanChayResponse layBaoCaoBanChay(LocalDateTime tuNgay, LocalDateTime denNgay);
    BaoCaoTonKhoResponse layBaoCaoTonKho(LocalDateTime tuNgay, LocalDateTime denNgay);
}
