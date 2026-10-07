package com.example.qlnh.service.impl;

import com.example.qlnh.converter.MonAnConverter;
import com.example.qlnh.dto.request.MonAnRequest;
import com.example.qlnh.dto.response.MonAnResponse;
import com.example.qlnh.dto.response.ThongKeMonAnResponse;
import com.example.qlnh.entity.MonAn;
import com.example.qlnh.enums.LoaiMon;
import com.example.qlnh.repository.MonAnRepository;
import com.example.qlnh.service.MonAnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MonAnServiceImpl implements MonAnService {

    @Autowired
    private MonAnRepository monAnRepository;

    @Autowired
    private MonAnConverter monAnConverter;

    @Override
    public List< MonAnResponse > layDanhSach(String keyword, String loaiMon) {
        String finalKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        LoaiMon enumLoaiMon = null;

        if (loaiMon != null && !loaiMon.trim().isEmpty() && !loaiMon.equals("Tất cả loại món")) {
            try {
                enumLoaiMon = LoaiMon.valueOf(loaiMon);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Mã loại món lọc không hợp lệ: " + loaiMon);
            }
        }

        List< MonAn > danhSach = monAnRepository.timKiemVaLoc(finalKeyword, enumLoaiMon);
        return danhSach.stream().map(monAnConverter::toResponse).collect(Collectors.toList());
    }

    @Override
    public ThongKeMonAnResponse layThongKe() {
        return ThongKeMonAnResponse.builder()
                .tongSoMon(monAnRepository.count())
                // SỬA LẠI TÊN HÀM GỌI ĐẾM TRẠNG THÁI
                .soMonConPhucVu(monAnRepository.countByTrangThai("Còn món"))
                .soMonTamNgung(monAnRepository.countByTrangThai("Hết món"))
                .donGiaTrungBinh(monAnRepository.tinhDonGiaTrungBinh() != null ? monAnRepository.tinhDonGiaTrungBinh() : 0.0)
                .build();
    }

    @Override
    public MonAnResponse layChiTiet(Long maMon) {
        MonAn mon = monAnRepository.findById(maMon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn!"));
        return monAnConverter.toResponse(mon);
    }

    @Override
    public MonAnResponse themMonAn(MonAnRequest request) {
        if (monAnRepository.existsByTenMonIgnoreCase(request.getTenMon().trim())) {
            throw new IllegalArgumentException("Tên món ăn này đã tồn tại trong thực đơn!");
        }

        MonAn monMoi = new MonAn();

        monMoi.setTenMon(request.getTenMon().trim());
        monMoi.setLoaiMon(request.getLoaiMon());
        monMoi.setDonViTinh(request.getDonViTinh());
        monMoi.setDonGia(request.getDonGia());
        // SỬA LẠI TRẠNG THÁI MẶC ĐỊNH LÀ "Còn món"
        monMoi.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "Còn món");

        return monAnConverter.toResponse(monAnRepository.save(monMoi));
    }

    @Override
    public MonAnResponse capNhatMonAn(Long maMon, MonAnRequest request) {
        MonAn monHienTai = monAnRepository.findById(maMon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn!"));

        monHienTai.setTenMon(request.getTenMon());
        monHienTai.setLoaiMon(request.getLoaiMon());
        monHienTai.setDonViTinh(request.getDonViTinh());
        monHienTai.setDonGia(request.getDonGia());

        // Validation nhẹ nếu FE lỡ truyền linh tinh
        if (request.getTrangThai() != null) {
            String status = request.getTrangThai().trim();
            if(!status.equals("Còn món") && !status.equals("Hết món")) {
                status = "Còn món"; // Hoặc throw Exception tùy bác
            }
            monHienTai.setTrangThai(status);
        }

        return monAnConverter.toResponse(monAnRepository.save(monHienTai));
    }
}