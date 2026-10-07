package com.example.qlnh.service.impl;

import com.example.qlnh.dto.response.baocao.*;
import com.example.qlnh.repository.*;
import com.example.qlnh.service.BaoCaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BaoCaoServiceImpl implements BaoCaoService {

    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private ChiTietGoiMonRepository chiTietGoiMonRepository;
    @Autowired private NguyenVatLieuRepository nguyenVatLieuRepository;
    @Autowired private PhieuNhapKhoRepository phieuNhapKhoRepository;

    @Override
    public BaoCaoDoanhThuResponse layBaoCaoDoanhThu(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<BaoCaoDoanhThuResponse.ChiTiet> chiTietList = hoaDonRepository.layChiTietDoanhThu(tuNgay, denNgay);

        BaoCaoDoanhThuResponse.TongQuan tongQuan = new BaoCaoDoanhThuResponse.TongQuan();
        long tongHD = 0;
        double tongDT = 0, thucThu = 0;

        for (BaoCaoDoanhThuResponse.ChiTiet ct : chiTietList) {
            tongHD += ct.getSoLuongDon();
            tongDT += ct.getDoanhSoBan();
            thucThu += ct.getThucThu();
        }

        tongQuan.setTongHoaDon(tongHD);
        tongQuan.setTongDoanhThu(tongDT);
        tongQuan.setThucThuSauThue(thucThu);
        tongQuan.setGiaTriTrungBinhDon(tongHD == 0 ? 0 : thucThu / tongHD);

        BaoCaoDoanhThuResponse response = new BaoCaoDoanhThuResponse();
        response.setTongQuan(tongQuan);
        response.setChiTietDanhSach(chiTietList);
        return response;
    }

    @Override
    public BaoCaoBanChayResponse layBaoCaoBanChay(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<Object[]> queryResults = chiTietGoiMonRepository.layChiTietBanChay(tuNgay, denNgay);
        List<BaoCaoBanChayResponse.ChiTiet> chiTietList = new java.util.ArrayList<>();
        for (Object[] row : queryResults) {
            String tenMon = (String) row[0];
            String loaiMon = (String) row[1];
            Long soLuongBan = ((Number) row[2]).longValue();
            Double tongTienThuDuoc = ((Number) row[3]).doubleValue();
            chiTietList.add(new BaoCaoBanChayResponse.ChiTiet(tenMon, loaiMon, soLuongBan, tongTienThuDuoc));
        }

        BaoCaoBanChayResponse.TongQuan tongQuan = new BaoCaoBanChayResponse.TongQuan();
        long tongPhan = 0;
        double tongDoanhThuMon = 0;

        for (BaoCaoBanChayResponse.ChiTiet ct : chiTietList) {
            tongPhan += ct.getSoLuongBan();
            tongDoanhThuMon += ct.getTongTienThuDuoc();
        }

        if (!chiTietList.isEmpty()) {
            tongQuan.setMonBanChayNhat(chiTietList.get(0).getTenMon());
        } else {
            tongQuan.setMonBanChayNhat("Chưa có dữ liệu");
        }

        tongQuan.setTongSoPhanDaBan(tongPhan);
        tongQuan.setTongDoanhThuMon(tongDoanhThuMon);

        BaoCaoBanChayResponse response = new BaoCaoBanChayResponse();
        response.setTongQuan(tongQuan);
        response.setChiTietDanhSach(chiTietList);
        return response;
    }

    @Override
    public BaoCaoTonKhoResponse layBaoCaoTonKho(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<BaoCaoTonKhoResponse.ChiTiet> chiTietList = nguyenVatLieuRepository.layChiTietTonKho(tuNgay, denNgay);

        BaoCaoTonKhoResponse.TongQuan tongQuan = new BaoCaoTonKhoResponse.TongQuan();
        tongQuan.setTongMaHang(nguyenVatLieuRepository.count());
        tongQuan.setSoLuongSapHet(nguyenVatLieuRepository.countNguyenVatLieuSapHet());
        tongQuan.setTongTienNhapTrongKy(phieuNhapKhoRepository.tinhTongTienNhapKho(tuNgay, denNgay));

        BaoCaoTonKhoResponse response = new BaoCaoTonKhoResponse();
        response.setTongQuan(tongQuan);
        response.setChiTietDanhSach(chiTietList);
        return response;
    }
}