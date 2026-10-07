package com.example.qlnh.service.impl;

import com.example.qlnh.dto.request.PhieuDatBanRequest;
import com.example.qlnh.dto.response.PhieuDatBanResponse;
import com.example.qlnh.entity.BanAn;
import com.example.qlnh.entity.KhachHang;
import com.example.qlnh.entity.PhieuDatBan;
import com.example.qlnh.repository.BanAnRepository;
import com.example.qlnh.repository.KhachHangRepository;
import com.example.qlnh.repository.PhieuDatBanRepository;
import com.example.qlnh.service.PhieuDatBanService;
import com.example.qlnh.util.SecurityUtil;
import com.example.qlnh.repository.NhanVienRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PhieuDatBanServiceImpl implements PhieuDatBanService {

    @Autowired
    private PhieuDatBanRepository phieuDatBanRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private BanAnRepository banAnRepository;

    @Autowired 
    private SecurityUtil securityUtil;

    @Autowired 
    private NhanVienRepository nhanVienRepository;   

    // 1. Hàm map Entity sang DTO để trả về cho Frontend
    private PhieuDatBanResponse toResponse(PhieuDatBan phieu) {
        PhieuDatBanResponse res = new PhieuDatBanResponse();
        res.setMaPhieuDB(phieu.getMaPhieuDB());
        res.setMaPhieuHienThi("#RES-" + phieu.getMaPhieuDB());
        res.setTenKhachHang(phieu.getKhachHang().getHoTen());
        res.setSoDienThoai(phieu.getKhachHang().getSoDienThoai());

        // Bóc tách ngày và giờ từ LocalDateTime của Entity ra riêng
        res.setNgayDat(phieu.getNgayGioDat().toLocalDate());
        res.setGioDat(phieu.getNgayGioDat().toLocalTime());

        res.setMaBan(phieu.getBanAn().getMaBan());
        res.setSoNguoiLon(phieu.getSoNguoiLon());
        res.setSoTreEm(phieu.getSoTreEm());
        res.setYeuCau(phieu.getYeuCau());
        res.setTrangThai(phieu.getTrangThai());
        return res;
    }

    // 2. Logic thông minh: Tìm khách cũ, nếu không có thì tạo mới, nếu có thì cập nhật tên mới nhất
    private KhachHang xuLyKhachHang(String hoTen, String soDienThoai) {
        KhachHang khachHang = khachHangRepository.findBySoDienThoai(soDienThoai)
                .orElse(new KhachHang());

        khachHang.setSoDienThoai(soDienThoai);
        khachHang.setHoTen(hoTen);

        return khachHangRepository.save(khachHang);
    }

    @Override
    public List< PhieuDatBanResponse > layDanhSach() {
        return phieuDatBanRepository.findAllByTrangThaiOrderByNgayGioDatAsc("Đã đặt").stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PhieuDatBanResponse layChiTiet(Long id) {
        PhieuDatBan phieu = phieuDatBanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu đặt bàn mã #" + id));
        return toResponse(phieu);
    }

    @Override
    public PhieuDatBanResponse taoPhieuDatBan(PhieuDatBanRequest request) {
        KhachHang kh = xuLyKhachHang(request.getTenKhachHang().trim(), request.getSoDienThoai().trim());

        BanAn ban = banAnRepository.findById(request.getMaBan())
                .orElseThrow(() -> new IllegalArgumentException("Bàn " + request.getMaBan() + " không tồn tại"));

        LocalDateTime ngayGioDatMoi = LocalDateTime.of(request.getNgayDat(), request.getGioDat());

        // Kiểm tra thời gian đặt bàn
        if (ngayGioDatMoi.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Không thể đặt bàn trong quá khứ!");
        }

        // Kiểm tra sức chứa của bàn
        int tongSoNguoi = (request.getSoNguoiLon() != null ? request.getSoNguoiLon() : 0) 
                        + (request.getSoTreEm() != null ? request.getSoTreEm() : 0);
        if (tongSoNguoi > ban.getSoCho()) {
            throw new IllegalArgumentException("Tổng số người (" + tongSoNguoi + ") vượt quá số chỗ của bàn (" + ban.getSoCho() + ")");
        }

        // Kiểm tra đụng độ (± 2 tiếng)
        LocalDateTime start = ngayGioDatMoi.minusHours(2);
        LocalDateTime end = ngayGioDatMoi.plusHours(2);
        List<PhieuDatBan> conflicts = phieuDatBanRepository.findConflicts(request.getMaBan(), start, end);
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Bàn " + request.getMaBan() + " đã có khách đặt vào lúc " + conflicts.get(0).getNgayGioDat().toLocalTime() + ". Vui lòng chọn giờ khác hoặc bàn khác!");
        }

        PhieuDatBan phieu = new PhieuDatBan();
        phieu.setKhachHang(kh);
        phieu.setBanAn(ban);
        phieu.setNgayGioDat(ngayGioDatMoi);
        phieu.setSoNguoiLon(request.getSoNguoiLon());
        phieu.setSoTreEm(request.getSoTreEm());
        phieu.setYeuCau(request.getYeuCau());
        String maNV = securityUtil.getCurrentMaNV();
        if (maNV != null) {
            nhanVienRepository.findById(maNV).ifPresent(phieu::setNhanVien);
        }

        // Khóa bàn ngay lập tức nếu lịch hẹn nằm trong khung 2 tiếng tới (hoặc trễ chưa quá 45p)
        LocalDateTime now = LocalDateTime.now();
        if (ngayGioDatMoi.isAfter(now.minusMinutes(45)) && ngayGioDatMoi.isBefore(now.plusHours(2))) {
            if ("Trống".equals(ban.getTrangThai())) {
                ban.setTrangThai("Đã đặt");
                banAnRepository.save(ban);
            }
        }

        return toResponse(phieuDatBanRepository.save(phieu));
    }

    @Override
    public PhieuDatBanResponse capNhatPhieu(Long id, PhieuDatBanRequest request) {
        PhieuDatBan phieu = phieuDatBanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu đặt bàn mã #" + id));

        KhachHang kh = xuLyKhachHang(request.getTenKhachHang().trim(), request.getSoDienThoai().trim());

        BanAn ban = banAnRepository.findById(request.getMaBan())
                .orElseThrow(() -> new IllegalArgumentException("Bàn " + request.getMaBan() + " không tồn tại"));

        LocalDateTime ngayGioDatMoi = LocalDateTime.of(request.getNgayDat(), request.getGioDat());

        // Kiểm tra thời gian đặt bàn
        if (ngayGioDatMoi.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Không thể đặt bàn trong quá khứ!");
        }

        // Kiểm tra sức chứa của bàn
        int tongSoNguoi = (request.getSoNguoiLon() != null ? request.getSoNguoiLon() : 0) 
                        + (request.getSoTreEm() != null ? request.getSoTreEm() : 0);
        if (tongSoNguoi > ban.getSoCho()) {
            throw new IllegalArgumentException("Tổng số người (" + tongSoNguoi + ") vượt quá số chỗ của bàn (" + ban.getSoCho() + ")");
        }

        // Kiểm tra đụng độ (± 2 tiếng)
        LocalDateTime start = ngayGioDatMoi.minusHours(2);
        LocalDateTime end = ngayGioDatMoi.plusHours(2);
        List<PhieuDatBan> conflicts = phieuDatBanRepository.findConflicts(request.getMaBan(), start, end);
        for (PhieuDatBan conflict : conflicts) {
            if (!conflict.getMaPhieuDB().equals(id)) {
                throw new IllegalArgumentException("Bàn " + request.getMaBan() + " đã có khách đặt vào lúc " + conflict.getNgayGioDat().toLocalTime() + ". Vui lòng chọn giờ khác hoặc bàn khác!");
            }
        }

        // Bàn cũ nếu đổi bàn
        BanAn banCu = phieu.getBanAn();
        if (!banCu.getMaBan().equals(ban.getMaBan())) {
            banCu.setTrangThai("Trống");
            banAnRepository.save(banCu);
        }

        phieu.setKhachHang(kh);
        phieu.setBanAn(ban);
        phieu.setNgayGioDat(ngayGioDatMoi);
        phieu.setSoNguoiLon(request.getSoNguoiLon());
        phieu.setSoTreEm(request.getSoTreEm());
        phieu.setYeuCau(request.getYeuCau());

        // Khóa bàn ngay lập tức nếu lịch hẹn mới nằm trong khung 2 tiếng tới
        LocalDateTime now = LocalDateTime.now();
        if (ngayGioDatMoi.isAfter(now.minusMinutes(45)) && ngayGioDatMoi.isBefore(now.plusHours(2))) {
            if ("Trống".equals(ban.getTrangThai())) {
                ban.setTrangThai("Đã đặt");
                banAnRepository.save(ban);
            }
        }

        return toResponse(phieuDatBanRepository.save(phieu));
    }

    @Override
    public void xoaPhieu(Long id) {
        PhieuDatBan phieu = phieuDatBanRepository.findById(id).orElse(null);
        if (phieu == null) {
            throw new IllegalArgumentException("Không tìm thấy phiếu đặt bàn mã #" + id + " để xóa");
        }
        
        phieu.setTrangThai("Đã hủy");
        phieuDatBanRepository.save(phieu);
        
        BanAn ban = phieu.getBanAn();
        
        // Trả bàn về trạng thái Trống nếu nó đang bị khóa bởi phiếu này
        if ("Đã đặt".equals(ban.getTrangThai())) {
            ban.setTrangThai("Trống");
            banAnRepository.save(ban);
        }
    }

    @Override
    public PhieuDatBanResponse xacNhanDenQuan(Long id) {
        PhieuDatBan phieu = phieuDatBanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu đặt bàn mã #" + id));
        phieu.setTrangThai("Đã đến quán");
        return toResponse(phieuDatBanRepository.save(phieu));
    }

    // Chạy ngầm mỗi 5 phút (300000ms) để giải phóng các bàn quá hạn 45 phút
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 300000)
    public void autoReleaseExpiredReservations() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(45);
        List<PhieuDatBan> expiredReservations = phieuDatBanRepository.findExpiredReservations(cutoffTime);
        
        for (PhieuDatBan phieu : expiredReservations) {
            BanAn ban = phieu.getBanAn();
            if ("Đã đặt".equals(ban.getTrangThai())) {
                ban.setTrangThai("Trống");
                banAnRepository.save(ban);
                phieuDatBanRepository.delete(phieu);
                System.out.println("Đã tự động hủy phiếu đặt bàn #" + phieu.getMaPhieuDB() + " do quá hạn 45 phút!");
            }
        }
    }

    // Chạy ngầm mỗi 5 phút (300000ms) để khóa các bàn sắp đến giờ đặt (trong vòng 2 tiếng)
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 300000)
    public void autoLockUpcomingReservations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lockTime = now.plusHours(2);
        List<PhieuDatBan> upcomingReservations = phieuDatBanRepository.findUpcomingReservationsToLock(now, lockTime);
        
        for (PhieuDatBan phieu : upcomingReservations) {
            BanAn ban = phieu.getBanAn();
            if ("Trống".equals(ban.getTrangThai())) {
                ban.setTrangThai("Đã đặt");
                banAnRepository.save(ban);
                System.out.println("Đã tự động khóa bàn " + ban.getTenBan() + " cho phiếu đặt bàn #" + phieu.getMaPhieuDB() + " sắp tới lúc " + phieu.getNgayGioDat().toLocalTime() + "!");
            }
        }
    }
}