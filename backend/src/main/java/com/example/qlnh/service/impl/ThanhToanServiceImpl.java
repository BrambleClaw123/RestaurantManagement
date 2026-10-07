package com.example.qlnh.service.impl;

import com.example.qlnh.dto.request.ChotHoaDonRequest;
import com.example.qlnh.dto.response.ChiTietMonResponse;
import com.example.qlnh.dto.response.ChiTietThanhToanResponse;
import com.example.qlnh.dto.response.DanhSachBanPhucVuResponse;
import com.example.qlnh.entity.BanAn;
import com.example.qlnh.entity.ChiTietGoiMon;
import com.example.qlnh.entity.HoaDon;
import com.example.qlnh.entity.KhuyenMai;
import com.example.qlnh.entity.PhieuDatBan;
import com.example.qlnh.entity.PhieuGoiMon;
import com.example.qlnh.repository.BanAnRepository;
import com.example.qlnh.repository.ChiTietGoiMonRepository;
import com.example.qlnh.repository.HoaDonRepository;
import com.example.qlnh.repository.KhuyenMaiRepository;
import com.example.qlnh.repository.PhieuDatBanRepository;
import com.example.qlnh.repository.PhieuGoiMonRepository;
import com.example.qlnh.service.ThanhToanService;
import com.example.qlnh.util.SecurityUtil;
import com.example.qlnh.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ThanhToanServiceImpl implements ThanhToanService {

    @Autowired private BanAnRepository banAnRepository;
    @Autowired private PhieuGoiMonRepository phieuGoiMonRepository;
    @Autowired private PhieuDatBanRepository phieuDatBanRepository;
    @Autowired private ChiTietGoiMonRepository chiTietGoiMonRepository;
    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private KhuyenMaiRepository khuyenMaiRepository;
    @Autowired private SecurityUtil securityUtil;
    @Autowired private NhanVienRepository nhanVienRepository;

    @Override
    public List< DanhSachBanPhucVuResponse > layDanhSachBanDangPhucVu(String keyword) {
        List< BanAn > banDangPhucVu = banAnRepository.findByTrangThai("Đang phục vụ");

        List< DanhSachBanPhucVuResponse > ketQua = banDangPhucVu.stream().map(ban -> {
            DanhSachBanPhucVuResponse res = new DanhSachBanPhucVuResponse();
            res.setMaBan(ban.getMaBan());
            res.setTenBan(ban.getTenBan());
            res.setTrangThai("Đang chọn thanh toán");

            Optional< PhieuGoiMon > phieuGM = phieuGoiMonRepository.findFirstByBanAn_MaBanOrderByThoiGianLapDesc(ban.getMaBan());
            if (phieuGM.isPresent()) {
                res.setMaPhieuGM(phieuGM.get().getMaPhieuGM());
                res.setMaPhieuHienThi("#ORD-" + phieuGM.get().getMaPhieuGM());
            } else {
                res.setMaPhieuHienThi("#ORD-N/A");
            }

            Optional< PhieuDatBan > phieuDB = phieuDatBanRepository.findFirstByBanAn_MaBanOrderByNgayGioDatDesc(ban.getMaBan());
            if (phieuDB.isPresent() && phieuDB.get().getKhachHang() != null) {
                res.setTenKhachHang(phieuDB.get().getKhachHang().getHoTen());
                res.setSoDienThoai(phieuDB.get().getKhachHang().getSoDienThoai());
            } else {
                res.setTenKhachHang("Khách tại bàn");
                res.setSoDienThoai("N/A");
            }

            return res;
        }).collect(Collectors.toList());

        // LOGIC LỌC TÌM KIẾM Ở ĐÂY
        if (keyword != null && !keyword.trim().isEmpty()) {
            String tuKhoa = keyword.trim().toLowerCase();
            ketQua = ketQua.stream()
                    .filter(r -> (r.getTenBan() != null && r.getTenBan().toLowerCase().contains(tuKhoa)) ||
                            (r.getMaPhieuHienThi() != null && r.getMaPhieuHienThi().toLowerCase().contains(tuKhoa)))
                    .collect(Collectors.toList());
        }

        return ketQua;
    }

    @Override
    public ChiTietThanhToanResponse layChiTietThanhToan(Long maPhieuGM) {
        PhieuGoiMon phieu = phieuGoiMonRepository.findById(maPhieuGM)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Phiếu gọi món #" + maPhieuGM));

        ChiTietThanhToanResponse response = new ChiTietThanhToanResponse();
        response.setTenBan(phieu.getBanAn().getTenBan());
        response.setMaPhieuHienThi("#ORD-" + phieu.getMaPhieuGM());
        response.setTrangThai("Chờ tính tiền");

        Optional< PhieuDatBan > phieuDB = phieuDatBanRepository.findFirstByBanAn_MaBanOrderByNgayGioDatDesc(phieu.getBanAn().getMaBan());
        if (phieuDB.isPresent() && phieuDB.get().getKhachHang() != null) {
            response.setTenKhachHang(phieuDB.get().getKhachHang().getHoTen());
        } else {
            response.setTenKhachHang("Khách tại bàn");
        }

        List< ChiTietGoiMon > chiTietGoiMons = chiTietGoiMonRepository.findByPhieuGoiMon_MaPhieuGM(maPhieuGM);
        double tongTienMon = 0.0;

        java.util.Map<Long, ChiTietMonResponse> monMap = new java.util.LinkedHashMap<>();
        for (ChiTietGoiMon ct : chiTietGoiMons) {
            Long maMon = ct.getMonAn().getMaMon();
            if (monMap.containsKey(maMon)) {
                ChiTietMonResponse existing = monMap.get(maMon);
                existing.setSoLuong(existing.getSoLuong() + ct.getSoLuong());
                existing.setThanhTien(existing.getThanhTien() + (ct.getSoLuong() * ct.getDonGia()));
            } else {
                double thanhTien = ct.getSoLuong() * ct.getDonGia();
                monMap.put(maMon, new ChiTietMonResponse(
                        ct.getMonAn().getTenMon(),
                        ct.getSoLuong(),
                        ct.getDonGia(),
                        thanhTien
                ));
            }
        }
        List< ChiTietMonResponse > danhSachMon = new java.util.ArrayList<>(monMap.values());

        for (ChiTietMonResponse mon : danhSachMon) {
            tongTienMon += mon.getThanhTien();
        }

        double thueVAT = tongTienMon * 0.08;
        double tongThanhToan = tongTienMon + thueVAT;

        response.setDanhSachMon(danhSachMon);
        response.setTongTienMon(tongTienMon);
        response.setThueVAT(thueVAT);
        response.setTongThanhToan(tongThanhToan);

        return response;
    }

    @Override
    public ChiTietThanhToanResponse apDungKhuyenMai(Long maPhieuGM, String maKM) {
        ChiTietThanhToanResponse response = layChiTietThanhToan(maPhieuGM);

        if (maKM != null && !maKM.trim().isEmpty()) {
            KhuyenMai km = khuyenMaiRepository.findById(maKM.trim())
                    .orElseThrow(() -> new IllegalArgumentException("Mã khuyến mãi không tồn tại!"));

            // So sánh LocalDate với LocalDate.now()
            if (km.getNgayKetThuc() != null && km.getNgayKetThuc().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Mã khuyến mãi đã hết hạn!");
            }

            // Trừ thẳng số tiền cố định từ Entity KhuyenMai
            double tienKhuyenMai = km.getTienGiam() != null ? km.getTienGiam() : 0.0;
            double thueVAT = response.getTongTienMon() * 0.08;
            double tongThanhToan = response.getTongTienMon() + thueVAT - tienKhuyenMai;

            response.setTienKhuyenMai(tienKhuyenMai);
            response.setThueVAT(thueVAT);
            response.setTongThanhToan(tongThanhToan > 0 ? tongThanhToan : 0.0);
        }

        return response;
    }

    @Override
    @Transactional
    public String chotHoaDon(ChotHoaDonRequest request) {
        PhieuGoiMon phieu = phieuGoiMonRepository.findById(request.getMaPhieuGM())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Phiếu gọi món #" + request.getMaPhieuGM()));

        if (hoaDonRepository.existsByPhieuGoiMon_MaPhieuGM(phieu.getMaPhieuGM())) {
            throw new IllegalArgumentException("Phiếu order này đã được xuất hóa đơn rồi!");
        }

        List< ChiTietGoiMon > chiTietGoiMons = chiTietGoiMonRepository.findByPhieuGoiMon_MaPhieuGM(phieu.getMaPhieuGM());
        
        // Kiểm tra chặn thanh toán nếu bếp chưa làm xong món
        for (ChiTietGoiMon ct : chiTietGoiMons) {
            if (!"Đã xong".equals(ct.getTrangThaiBep())) {
                throw new IllegalArgumentException("Bàn này vẫn còn món chưa phục vụ xong, không thể chốt hóa đơn!");
            }
        }

        double tongTien = 0.0;
        for (ChiTietGoiMon ct : chiTietGoiMons) {
            tongTien += (ct.getSoLuong() * ct.getDonGia());
        }

        double thueVAT = tongTien * 0.08;
        double tienKhuyenMai = 0.0;
        KhuyenMai khuyenMaiApDung = null;

        if (request.getMaKhuyenMai() != null && !request.getMaKhuyenMai().trim().isEmpty()) {
            khuyenMaiApDung = khuyenMaiRepository.findById(request.getMaKhuyenMai().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Mã khuyến mãi không tồn tại!"));

            if (khuyenMaiApDung.getNgayKetThuc() != null && khuyenMaiApDung.getNgayKetThuc().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Mã khuyến mãi đã hết hạn!");
            }

            // Lấy thẳng số tiền giảm thay vì nhân phần trăm
            tienKhuyenMai = khuyenMaiApDung.getTienGiam() != null ? khuyenMaiApDung.getTienGiam() : 0.0;
        }

        double tongThanhToan = tongTien + thueVAT - tienKhuyenMai;
        if (tongThanhToan < 0) tongThanhToan = 0.0;

        HoaDon hoaDon = new HoaDon();
        hoaDon.setPhieuGoiMon(phieu);
        hoaDon.setKhuyenMai(khuyenMaiApDung);
        hoaDon.setNgayGio(LocalDateTime.now());
        hoaDon.setTongTien(tongTien);
        hoaDon.setThueVAT(thueVAT);
        hoaDon.setTienKhuyenMai(tienKhuyenMai);
        hoaDon.setTongThanhToan(tongThanhToan);
        String maNV = securityUtil.getCurrentMaNV();
        if (maNV != null) {
            nhanVienRepository.findById(maNV).ifPresent(hoaDon::setNhanVien);
        }

        hoaDonRepository.save(hoaDon);

        BanAn ban = banAnRepository.findById(phieu.getBanAn().getMaBan())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn ăn"));
        ban.setTrangThai("Trống");
        banAnRepository.save(ban);

        return "Thanh toán thành công! Bàn " + ban.getTenBan() + " đã được dọn trống.";
    }
}