package com.example.qlnh.service.impl;

import com.example.qlnh.dto.response.BepMonResponse;
import com.example.qlnh.dto.response.BepOrderResponse;
import com.example.qlnh.dto.response.TrangThaiMonResponse;
import com.example.qlnh.entity.ChiTietGoiMon;
import com.example.qlnh.entity.MonAn;
import com.example.qlnh.entity.PhieuGoiMon;
import com.example.qlnh.repository.ChiTietGoiMonRepository;
import com.example.qlnh.repository.MonAnRepository;
import com.example.qlnh.repository.PhieuGoiMonRepository;
import com.example.qlnh.service.BepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BepServiceImpl implements BepService {

    @Autowired private PhieuGoiMonRepository phieuGoiMonRepository;
    @Autowired private ChiTietGoiMonRepository chiTietGoiMonRepository;
    @Autowired private MonAnRepository monAnRepository;

    @Override
    @Transactional
    public List< BepOrderResponse > layDanhSachOrder() {
        List< PhieuGoiMon > pendingOrders = phieuGoiMonRepository.findPhieuGoiMonChuaXong();
        List< BepOrderResponse > result = new ArrayList<>();

        int waitCount = 1;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        for (int i = 0; i < pendingOrders.size(); i++) {
            PhieuGoiMon phieu = pendingOrders.get(i);
            List< ChiTietGoiMon > chiTietList = chiTietGoiMonRepository.findByPhieuGoiMon_MaPhieuGM(phieu.getMaPhieuGM());

            List< ChiTietGoiMon > monChuaXong = chiTietList.stream()
                    .filter(ct -> !"Đã xong".equals(ct.getTrangThaiBep()))
                    .collect(Collectors.toList());

            if (monChuaXong.isEmpty()) continue;

            BepOrderResponse res = new BepOrderResponse();
            res.setMaBan(phieu.getBanAn().getTenBan());
            res.setMaPhieuGM(phieu.getMaPhieuGM());
            res.setMaPhieuHienThi("#ORD-" + phieu.getMaPhieuGM());
            res.setThoiGian(phieu.getThoiGianLap().format(formatter));

            // Đã xóa ghi chú chung của phiếu

            if (i == 0) {
                res.setTrangThai("ĐANG NẤU");
                res.setViTriDoi(null);
                
                // FIX: Đồng bộ trạng thái "Đang nấu" xuống CSDL để Phục vụ nhìn thấy
                boolean needSave = false;
                for (ChiTietGoiMon ct : monChuaXong) {
                    if ("Chờ chế biến".equals(ct.getTrangThaiBep())) {
                        ct.setTrangThaiBep("Đang nấu");
                        needSave = true;
                    }
                }
                if (needSave) {
                    chiTietGoiMonRepository.saveAll(monChuaXong);
                }
                
            } else {
                res.setTrangThai("CHỜ CHẾ BIẾN");
                res.setViTriDoi("Đang đợi #" + waitCount);
                waitCount++;
            }

            // Map list món ăn (bây giờ chỉ còn tên và số lượng)
            List< BepMonResponse > danhSachMon = monChuaXong.stream().map(ct -> {
                BepMonResponse monRes = new BepMonResponse();
                monRes.setTenMon(ct.getMonAn().getTenMon());
                monRes.setSoLuong(ct.getSoLuong());
                monRes.setGhiChu(ct.getGhiChu());
                return monRes;
            }).collect(Collectors.toList());

            res.setDanhSachMon(danhSachMon);
            result.add(res);
        }
        return result;
    }

    @Override
    @Transactional
    public void hoanTatOrder(Long maPhieuGM) {
        // 1. Chuyển toàn bộ món của Order hiện tại sang "Đã xong"
        List< ChiTietGoiMon > chiTietList = chiTietGoiMonRepository.findByPhieuGoiMon_MaPhieuGM(maPhieuGM);
        for (ChiTietGoiMon ct : chiTietList) {
            ct.setTrangThaiBep("Đã xong");
        }
        chiTietGoiMonRepository.saveAll(chiTietList);

        // 2. Tìm phiếu tiếp theo trong hàng đợi để tự động chuyển trạng thái DB sang "Đang nấu"
        List< PhieuGoiMon > pendingOrders = phieuGoiMonRepository.findPhieuGoiMonChuaXong();
        if (!pendingOrders.isEmpty()) {
            PhieuGoiMon nextPhieu = pendingOrders.get(0);
            List< ChiTietGoiMon > nextDetails = chiTietGoiMonRepository.findByPhieuGoiMon_MaPhieuGM(nextPhieu.getMaPhieuGM());
            for (ChiTietGoiMon ct : nextDetails) {
                if ("Chờ chế biến".equals(ct.getTrangThaiBep())) {
                    ct.setTrangThaiBep("Đang nấu");
                }
            }
            chiTietGoiMonRepository.saveAll(nextDetails);
        }
    }

    @Override
    public List< TrangThaiMonResponse > layDanhSachThucDon(String keyword) {
        List< MonAn > danhSachMon;

        if (keyword != null && !keyword.trim().isEmpty()) {
            danhSachMon = monAnRepository.findByTenMonContainingIgnoreCase(keyword.trim());
        } else {
            danhSachMon = monAnRepository.findAll();
        }

        return danhSachMon.stream().map(mon -> {
            TrangThaiMonResponse res = new TrangThaiMonResponse();
            res.setMaMon(mon.getMaMon());
            res.setTenMon(mon.getTenMon());

            res.setLoaiMon(mon.getLoaiMon() != null ? mon.getLoaiMon().getGiaTri() : "");

            res.setDonViTinh(mon.getDonViTinh() != null ? mon.getDonViTinh().getGiaTri() : "");

            res.setConMon("Còn món".equalsIgnoreCase(mon.getTrangThai()));

            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public void capNhatTrangThaiMon(Long maMon, Boolean conMon) {
        MonAn mon = monAnRepository.findById(maMon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn mã: " + maMon));

        // Map Boolean từ UI gửi xuống thành String lưu vào Database
        mon.setTrangThai((conMon != null && conMon) ? "Còn món" : "Hết món");

        monAnRepository.save(mon);
    }

}