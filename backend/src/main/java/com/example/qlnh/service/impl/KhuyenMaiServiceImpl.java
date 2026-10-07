package com.example.qlnh.service.impl;

import com.example.qlnh.dto.request.KhuyenMaiRequest;
import com.example.qlnh.dto.response.KhuyenMaiResponse;
import com.example.qlnh.entity.KhuyenMai;
import com.example.qlnh.repository.KhuyenMaiRepository;
import com.example.qlnh.service.KhuyenMaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KhuyenMaiServiceImpl implements KhuyenMaiService {

    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    private KhuyenMaiResponse toResponse(KhuyenMai km) {
        KhuyenMaiResponse res = new KhuyenMaiResponse();
        res.setMaKM(km.getMaKM());
        res.setTenKM(km.getTenKM());
        res.setTienGiam(km.getTienGiam());
        res.setNgayKetThuc(km.getNgayKetThuc());

        // Logic nhỏ: Tự tính trạng thái cho FE dễ đổi màu chữ
        if (km.getNgayKetThuc() != null && km.getNgayKetThuc().isBefore(LocalDate.now())) {
            res.setTrangThai("Đã hết hạn");
        } else {
            res.setTrangThai("Đang áp dụng");
        }
        return res;
    }

    @Override
    public List< KhuyenMaiResponse > layDanhSach() {
        return khuyenMaiRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public KhuyenMaiResponse layChiTiet(String maKM) {
        KhuyenMai km = khuyenMaiRepository.findById(maKM)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mã khuyến mãi: " + maKM));
        return toResponse(km);
    }

    @Override
    public KhuyenMaiResponse taoKhuyenMai(KhuyenMaiRequest request) {
        // Validation cơ bản
        if (request.getMaKM() == null || request.getMaKM().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã khuyến mãi không được để trống");
        }
        if (khuyenMaiRepository.existsById(request.getMaKM().trim())) {
            throw new IllegalArgumentException("Mã khuyến mãi '" + request.getMaKM() + "' đã tồn tại!");
        }

        KhuyenMai km = new KhuyenMai();
        km.setMaKM(request.getMaKM().trim().toUpperCase()); // Chuẩn hóa mã viết hoa
        km.setTenKM(request.getTenKM());
        km.setTienGiam(request.getTienGiam() != null ? request.getTienGiam() : 0.0);
        km.setNgayKetThuc(request.getNgayKetThuc());

        return toResponse(khuyenMaiRepository.save(km));
    }

    @Override
    public KhuyenMaiResponse capNhatKhuyenMai(String maKM, KhuyenMaiRequest request) {
        KhuyenMai km = khuyenMaiRepository.findById(maKM)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mã khuyến mãi: " + maKM));

        km.setTenKM(request.getTenKM());
        km.setTienGiam(request.getTienGiam() != null ? request.getTienGiam() : 0.0);
        km.setNgayKetThuc(request.getNgayKetThuc());

        return toResponse(khuyenMaiRepository.save(km));
    }

    @Override
    public void xoaKhuyenMai(String maKM) {
        if (!khuyenMaiRepository.existsById(maKM)) {
            throw new IllegalArgumentException("Không tìm thấy mã khuyến mãi: " + maKM);
        }
        // Lưu ý: Nếu mã này đã được dùng trong Hóa Đơn (bị dính khóa ngoại), thao tác deleteById có thể quăng DataIntegrityViolationException.
        // Sau này nếu cần bạn có thể bắt lỗi đó ở Controller hoặc đổi sang xóa mềm (cấp cờ active = false).
        khuyenMaiRepository.deleteById(maKM);
    }
}