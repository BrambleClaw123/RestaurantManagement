package com.example.qlnh.service.impl;

import com.example.qlnh.dto.request.ThemMonRequest;
import com.example.qlnh.dto.response.BanPhucVuOverviewResponse;
import com.example.qlnh.dto.response.ChiTietBanPhucVuResponse;
import com.example.qlnh.dto.response.ChiTietMonPhucVuResponse;
import com.example.qlnh.dto.response.ThucDonPhucVuResponse;
import com.example.qlnh.entity.*;
import com.example.qlnh.repository.*;
import com.example.qlnh.service.PhucVuService;
import com.example.qlnh.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PhucVuServiceImpl implements PhucVuService {

    @Autowired private BanAnRepository banAnRepository;
    @Autowired private PhieuGoiMonRepository phieuGoiMonRepository;
    @Autowired private PhieuDatBanRepository phieuDatBanRepository;
    @Autowired private ChiTietGoiMonRepository chiTietGoiMonRepository;
    @Autowired private MonAnRepository monAnRepository;
    @Autowired private NhanVienRepository nhanVienRepository;
    @Autowired private SecurityUtil securityUtil;
    @Override
    public List< BanPhucVuOverviewResponse > layDanhSachBanTongQuan() {
        List< BanAn > danhSachBan = banAnRepository.findAll();

        return danhSachBan.stream().map(ban -> {
            BanPhucVuOverviewResponse res = new BanPhucVuOverviewResponse();
            res.setMaBan(ban.getMaBan());
            res.setTenBan(ban.getTenBan());
            res.setTrangThai(ban.getTrangThai());

            // Xử lý logic hiển thị mã phiếu dưới góc trái thẻ bài
            if ("Đang phục vụ".equalsIgnoreCase(ban.getTrangThai())) {
                Optional< PhieuGoiMon > phieuGM = phieuGoiMonRepository.findFirstByBanAn_MaBanOrderByThoiGianLapDesc(ban.getMaBan());
                if (phieuGM.isPresent()) {
                    res.setMaPhieuHienThi("#ORD-" + phieuGM.get().getMaPhieuGM());
                } else {
                    res.setMaPhieuHienThi("#ORD-N/A");
                }
            }
            else if ("Đã đặt".equalsIgnoreCase(ban.getTrangThai()) || "Đã đặt trước".equalsIgnoreCase(ban.getTrangThai())) {
                Optional< PhieuDatBan > phieuDB = phieuDatBanRepository.findFirstByBanAn_MaBanOrderByNgayGioDatDesc(ban.getMaBan());
                if (phieuDB.isPresent()) {
                    res.setMaPhieuHienThi("#RES-" + phieuDB.get().getMaPhieuDB()); // Đổi getId() thành tên trường khóa chính của Phiếu Đặt Bàn nhé
                } else {
                    res.setMaPhieuHienThi("#RES-N/A");
                }
            }
            else {
                // Bàn trống (Mặc định hiển thị mã bàn theo dạng #TB-...)
                res.setMaPhieuHienThi("#TB-" + ban.getMaBan().replaceAll("[^0-9]", "")); // Lọc lấy số để giống UI
            }

            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public ChiTietBanPhucVuResponse layChiTietBan(String maBan) {
        BanAn ban = banAnRepository.findById(maBan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn: " + maBan));

        ChiTietBanPhucVuResponse res = new ChiTietBanPhucVuResponse();
        res.setMaBan(ban.getMaBan());
        res.setTenBan(ban.getTenBan());
        res.setTrangThai(ban.getTrangThai());

        // Nếu bàn đang phục vụ thì mới đi tìm Phiếu gọi món và danh sách món ăn
        if ("Đang phục vụ".equalsIgnoreCase(ban.getTrangThai())) {
            Optional< PhieuGoiMon > phieuOpt = phieuGoiMonRepository.findFirstByBanAn_MaBanOrderByThoiGianLapDesc(maBan);

            if (phieuOpt.isPresent()) {
                PhieuGoiMon phieu = phieuOpt.get();
                res.setMaPhieuGM(phieu.getMaPhieuGM());
                res.setMaPhieuHienThi("#ORD-" + phieu.getMaPhieuGM());

                List<ChiTietGoiMon> chiTietList = chiTietGoiMonRepository.findByPhieuGoiMon_MaPhieuGM(phieu.getMaPhieuGM());
                List<ChiTietMonPhucVuResponse> danhSachMon = chiTietList.stream().map(ct -> {
                    ChiTietMonPhucVuResponse monRes = new ChiTietMonPhucVuResponse();
                    monRes.setId(ct.getId());
                    monRes.setMaMon(ct.getMonAn().getMaMon());
                    monRes.setTenMon(ct.getMonAn().getTenMon());
                    monRes.setSoLuong(ct.getSoLuong());
                    monRes.setDonGia(ct.getDonGia());
                    monRes.setTrangThaiBep(ct.getTrangThaiBep());
                    monRes.setGhiChu(ct.getGhiChu());
                    return monRes;
                }).collect(Collectors.toList());

                res.setDanhSachMon(danhSachMon);
            }
        } else {
            // Nếu bàn Trống hoặc Đã đặt, trả về mã phiếu hiển thị tương ứng và mảng rỗng
            if ("Đã đặt".equalsIgnoreCase(ban.getTrangThai()) || "Đã đặt trước".equalsIgnoreCase(ban.getTrangThai())) {
                Optional< PhieuDatBan > phieuDB = phieuDatBanRepository.findFirstByBanAn_MaBanOrderByNgayGioDatDesc(ban.getMaBan());
                if (phieuDB.isPresent()) {
                    res.setMaPhieuHienThi("#RES-" + phieuDB.get().getMaPhieuDB());
                    res.setTenKhachDatBan(phieuDB.get().getKhachHang() != null ? phieuDB.get().getKhachHang().getHoTen() : "Khách");
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
                    res.setThoiGianDatBan(phieuDB.get().getNgayGioDat().format(formatter));
                } else {
                    res.setMaPhieuHienThi("#RES-N/A");
                }
            } else {
                res.setMaPhieuHienThi("#TB-" + ban.getMaBan().replaceAll("[^0-9]", ""));
            }
            res.setDanhSachMon(List.of()); // Mảng rỗng cho Frontend hiển thị "Chưa có món ăn nào"
        }

        return res;
    }

    @Override
    @Transactional
    public String moBan(String maBan, String maNVfrontend) {
        BanAn ban = banAnRepository.findById(maBan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn: " + maBan));

        if ("Đang phục vụ".equalsIgnoreCase(ban.getTrangThai())) {
            throw new IllegalArgumentException("Bàn này đang được phục vụ rồi!");
        }

        // 1. Chuyển trạng thái bàn
        ban.setTrangThai("Đang phục vụ");
        banAnRepository.save(ban);

        // 2. Tạo Phiếu Gọi Món mới toanh
        PhieuGoiMon phieuMoi = new PhieuGoiMon();
        phieuMoi.setBanAn(ban);
        phieuMoi.setThoiGianLap(LocalDateTime.now());
        phieuMoi.setThoiGianSua(LocalDateTime.now());
        
        String maNV = securityUtil.getCurrentMaNV();
        if (maNV != null) {
            nhanVienRepository.findById(maNV).ifPresent(phieuMoi::setNhanVien);
        }

        phieuGoiMonRepository.save(phieuMoi);

        return "Mở bàn thành công! Mã phiếu order: #ORD-" + phieuMoi.getMaPhieuGM();
    }

    // --- API 3: Lấy thực đơn (chỉ lấy món Còn) ---
    @Override
    public List layThucDon() {
        // Hứng dưới dạng raw List để tránh lỗi incompatible types
        @SuppressWarnings("rawtypes")
        java.util.List menu = monAnRepository.findByTrangThai("Còn món");
        
        List danhSachTraVe = new java.util.ArrayList<>();
        
        for (Object obj : menu) {
            // Ép kiểu tường minh từng phần tử Object sang MonAn
            MonAn mon = (MonAn) obj; 
            
            ThucDonPhucVuResponse res = new ThucDonPhucVuResponse();
            res.setMaMon(mon.getMaMon());
            res.setTenMon(mon.getTenMon());
            res.setLoaiMon(mon.getLoaiMon());
            res.setDonGia(mon.getDonGia());
            
            danhSachTraVe.add(res);
        }
        
        return danhSachTraVe;
    }

    // --- API 4: Thêm món vào bàn ---
    @Override
    @Transactional
    public void themMonVaoBan(Long maPhieuGM, ThemMonRequest request) {
        PhieuGoiMon phieu = phieuGoiMonRepository.findById(maPhieuGM)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Phiếu gọi món #" + maPhieuGM));

        for (ThemMonRequest.MonDuocChon monReq : request.getDanhSachMon()) {
            MonAn monAn = monAnRepository.findById(monReq.getMaMon())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Món ăn mã: " + monReq.getMaMon()));

            // Thêm mới hoàn toàn
            ChiTietGoiMon ct = new ChiTietGoiMon();
            ct.setPhieuGoiMon(phieu);
            ct.setMonAn(monAn);
            ct.setSoLuong(monReq.getSoLuong());
            ct.setDonGia(monAn.getDonGia()); // Lưu giá tại thời điểm gọi
            ct.setTrangThaiBep("Chờ chế biến"); // Ép cứng trạng thái cho bếp
            ct.setGhiChu(monReq.getGhiChu() != null ? monReq.getGhiChu().trim() : null);
            chiTietGoiMonRepository.save(ct);
        }

        // Cập nhật lại thời gian sửa của phiếu
        phieu.setThoiGianSua(LocalDateTime.now());
        phieuGoiMonRepository.save(phieu);
    }

    // --- API 5: Sửa số lượng ---
    @Override
    @Transactional
    public void suaSoLuongMon(Long id, Integer soLuongMoi) {
        if (soLuongMoi <= 0) throw new IllegalArgumentException("Số lượng phải lớn hơn 0");

        ChiTietGoiMon ct = chiTietGoiMonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi tiết gọi món"));

        // RÀNG BUỘC: Chỉ cho sửa nếu bếp chưa đụng tay vào
        if (!"Chờ chế biến".equals(ct.getTrangThaiBep())) {
            throw new IllegalArgumentException("Bếp đã tiếp nhận món này, không thể sửa số lượng!");
        }

        ct.setSoLuong(soLuongMoi);
        chiTietGoiMonRepository.save(ct);
    }

    // --- API 6: Hủy / Xóa món ---
    @Override
    @Transactional
    public void xoaMonAn(Long id) {
        ChiTietGoiMon ct = chiTietGoiMonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi tiết gọi món"));

        // RÀNG BUỘC: Chỉ cho xóa nếu bếp chưa nấu
        if (!"Chờ chế biến".equals(ct.getTrangThaiBep())) {
            throw new IllegalArgumentException("Bếp đang nấu hoặc đã ra món, không thể hủy!");
        }

        chiTietGoiMonRepository.delete(ct);
    }
}