package com.example.qlnh.service.impl;

import com.example.qlnh.dto.request.BanAnRequest;
import com.example.qlnh.dto.response.BanAnDropdownResponse;
import com.example.qlnh.dto.response.BanAnResponse;
import com.example.qlnh.entity.BanAn;
import com.example.qlnh.repository.BanAnRepository;
import com.example.qlnh.service.BanAnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BanAnServiceImpl implements BanAnService {

    @Autowired
    private BanAnRepository banAnRepository;

    // --- Helper Method ---
    private BanAnResponse toResponse(BanAn ban) {
        BanAnResponse res = new BanAnResponse();
        res.setMaBan(ban.getMaBan());
        res.setTenBan(ban.getTenBan());
        res.setSoCho(ban.getSoCho());
        res.setTrangThai(ban.getTrangThai());
        return res;
    }

    @Override
    public List< BanAnDropdownResponse > layDanhSachBanTrong() {
        return banAnRepository.findByTrangThai("Trống").stream().map(ban -> {
            BanAnDropdownResponse dto = new BanAnDropdownResponse();
            dto.setMaBan(ban.getMaBan());
            dto.setNhanHienThi(String.format("%s (%s - %d chỗ)", ban.getTenBan(), ban.getTrangThai(), ban.getSoCho()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List< BanAnResponse > layTatCaBan() {
        return banAnRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BanAnResponse layChiTietBan(String maBan) {
        BanAn ban = banAnRepository.findById(maBan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn ăn mã: " + maBan));
        return toResponse(ban);
    }

    @Override
    public BanAnResponse themBanAn(BanAnRequest request) {
        if (banAnRepository.existsById(request.getMaBan())) {
            throw new IllegalArgumentException("Mã bàn đã tồn tại!");
        }
        if (banAnRepository.existsByTenBanIgnoreCase(request.getTenBan())) {
            throw new IllegalArgumentException("Tên bàn đã tồn tại!");
        }

        BanAn ban = new BanAn();
        ban.setMaBan(request.getMaBan());
        ban.setTenBan(request.getTenBan());
        ban.setSoCho(request.getSoCho());
        ban.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "Trống");

        return toResponse(banAnRepository.save(ban));
    }

    @Override
    public BanAnResponse capNhatBanAn(String maBan, BanAnRequest request) {
        BanAn ban = banAnRepository.findById(maBan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn ăn mã: " + maBan));

        if (banAnRepository.existsByTenBanIgnoreCaseAndMaBanNot(request.getTenBan(), maBan)) {
            throw new IllegalArgumentException("Tên bàn đã bị trùng với một bàn khác!");
        }

        ban.setTenBan(request.getTenBan());
        ban.setSoCho(request.getSoCho());
        if (request.getTrangThai() != null) {
            ban.setTrangThai(request.getTrangThai());
        }

        return toResponse(banAnRepository.save(ban));
    }

    @Override
    public void xoaBanAn(String maBan) {
        if (!banAnRepository.existsById(maBan)) {
            throw new IllegalArgumentException("Không tìm thấy bàn ăn mã: " + maBan);
        }
        banAnRepository.deleteById(maBan);
    }
}