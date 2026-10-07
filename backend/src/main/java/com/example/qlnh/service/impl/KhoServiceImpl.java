package com.example.qlnh.service.impl;

import com.example.qlnh.dto.request.NguyenVatLieuRequest;
import com.example.qlnh.dto.request.TaoPhieuNhapRequest;
import com.example.qlnh.dto.response.*;
import com.example.qlnh.entity.ChiTietNhapKho;
import com.example.qlnh.entity.NguyenVatLieu;
import com.example.qlnh.entity.NhaCungCap;
import com.example.qlnh.entity.PhieuNhapKho;
import com.example.qlnh.repository.ChiTietNhapKhoRepository;
import com.example.qlnh.repository.NguyenVatLieuRepository;
import com.example.qlnh.repository.NhaCungCapRepository;
import com.example.qlnh.repository.PhieuNhapKhoRepository;
import com.example.qlnh.service.KhoService;
import com.example.qlnh.util.SecurityUtil;
import com.example.qlnh.repository.NhanVienRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KhoServiceImpl implements KhoService {

    @Autowired
    private NguyenVatLieuRepository nvlRepository;
    @Autowired private NhaCungCapRepository nhaCungCapRepository;
    @Autowired private PhieuNhapKhoRepository phieuNhapKhoRepository;
    @Autowired private ChiTietNhapKhoRepository chiTietNhapKhoRepository;
    @Autowired private SecurityUtil securityUtil;
    @Autowired private NhanVienRepository nhanVienRepository;

    @Override
    public KhoThongKeResponse layThongKe() {
        return KhoThongKeResponse.builder()
                .tongMatHang(nvlRepository.count())
                .conHangOnDinh(nvlRepository.countByTrangThai("Còn hàng"))
                .sapHetHang(nvlRepository.countByTrangThai("Sắp hết"))
                .daHetHang(nvlRepository.countByTrangThai("Hết hàng"))
                .build();
    }

    @Override
    public List< NguyenVatLieuResponse > layDanhSachNVL(String keyword) {
        // Xử lý keyword an toàn
        String finalKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        // Gọi DB lấy list Entity
        List< NguyenVatLieu > danhSach = nvlRepository.timKiem(finalKeyword);

        // Map sang DTO Response để trả về UI
        return danhSach.stream().map(nvl -> {
            NguyenVatLieuResponse res = new NguyenVatLieuResponse();
            res.setMaNVL(nvl.getMaNVL());
            res.setTenNVL(nvl.getTenNVL());
            res.setDonVi(nvl.getDonVi());
            res.setSoLuongTon(nvl.getSoLuongTon());
            res.setTrangThai(nvl.getTrangThai());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public NhaCungCapResponse themNhaCungCap(java.util.Map<String, String> request) {
        String ten = request.get("tenNCC");
        String sdt = request.get("soDienThoai");
        if (ten == null || ten.trim().isEmpty()) throw new IllegalArgumentException("Tên nhà cung cấp không được để trống");
        
        NhaCungCap ncc = new NhaCungCap();
        String maNCC = "NCC" + System.currentTimeMillis();
        ncc.setMaNCC(maNCC);
        ncc.setTenNCC(ten);
        ncc.setSoDienThoai(sdt);
        nhaCungCapRepository.save(ncc);
        
        NhaCungCapResponse res = new NhaCungCapResponse();
        res.setMaNCC(ncc.getMaNCC());
        res.setTenNCC(ncc.getTenNCC());
        res.setSoDienThoai(ncc.getSoDienThoai());
        return res;
    }

    @Override
    public List< NhaCungCapResponse > layDanhSachNhaCungCap() {
        return nhaCungCapRepository.findAll().stream().map(ncc -> {
            NhaCungCapResponse res = new NhaCungCapResponse();
            res.setMaNCC(ncc.getMaNCC());
            res.setTenNCC(ncc.getTenNCC());

            res.setSoDienThoai(ncc.getSoDienThoai());

            return res;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String taoPhieuNhapKho(TaoPhieuNhapRequest request) {
        // 1. Kiểm tra Nhà Cung Cấp
        NhaCungCap ncc = nhaCungCapRepository.findById(request.getMaNCC())
                .orElseThrow(() -> new IllegalArgumentException("Nhà cung cấp không tồn tại!"));

        // 2. Tạo Phiếu Nhập Kho
        PhieuNhapKho phieu = new PhieuNhapKho();
        phieu.setNhaCungCap(ncc);
        phieu.setLyDoNhap(request.getLyDoNhap());
        phieu.setTongTienThanhToan(request.getTongTienThanhToan());
        phieu.setNgayLapPhieu(java.time.LocalDateTime.now());
       String maNV = securityUtil.getCurrentMaNV();
        if (maNV != null) {
            nhanVienRepository.findById(maNV).ifPresent(phieu::setNhanVien);
        }

        phieuNhapKhoRepository.save(phieu);

        // 3. Xử lý Chi tiết phiếu & Gộp các dòng trùng maNVL
        Map< String, TaoPhieuNhapRequest.ChiTietNhap > mapGopChiTiet = new HashMap<>();
        for (TaoPhieuNhapRequest.ChiTietNhap itemReq : request.getDanhSachHang()) {
            if (mapGopChiTiet.containsKey(itemReq.getMaNVL())) {
                // Nếu trùng mã, cộng dồn số lượng
                TaoPhieuNhapRequest.ChiTietNhap existing = mapGopChiTiet.get(itemReq.getMaNVL());
                existing.setSoLuong(existing.getSoLuong() + itemReq.getSoLuong());
            } else {
                mapGopChiTiet.put(itemReq.getMaNVL(), itemReq);
            }
        }

        // 4. Lưu từng Chi tiết và Cập nhật Tồn kho
        for (TaoPhieuNhapRequest.ChiTietNhap itemReq : mapGopChiTiet.values()) {
            NguyenVatLieu nvl = nvlRepository.findById(itemReq.getMaNVL())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên vật liệu: " + itemReq.getMaNVL()));

            // Lưu chi tiết
            ChiTietNhapKho chiTiet = new ChiTietNhapKho();
            chiTiet.setPhieuNhapKho(phieu);
            chiTiet.setNguyenVatLieu(nvl);
            chiTiet.setSoLuong(itemReq.getSoLuong());
            chiTiet.setDonGia(itemReq.getDonGia());
            chiTietNhapKhoRepository.save(chiTiet);

            // Cập nhật tồn kho
            nvl.setSoLuongTon(nvl.getSoLuongTon() + itemReq.getSoLuong());
            // Sau khi nhập, chắc chắn là "Còn hàng"
            nvl.setTrangThai("Còn hàng");
            nvlRepository.save(nvl);
        }

        return "Tạo phiếu nhập thành công! Mã phiếu: #PNK-" + phieu.getMaPhieuNK();
    }
    @Override
    public List<PhieuNhapKhoResponse> layDanhSachPhieuNhap(String keyword) {
        String finalKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        // Lấy danh sách từ Database, đã sắp xếp giảm dần theo ngày nhập
        List< PhieuNhapKho > danhSach = phieuNhapKhoRepository.timKiemPhieuNhap(finalKeyword);

        return danhSach.stream().map(phieu -> {
            PhieuNhapKhoResponse res = new PhieuNhapKhoResponse();
            res.setId(phieu.getMaPhieuNK());

            // Format mã phiếu xịn sò giống UI: #PNK-Năm-ID (VD: #PNK-2026-0089)
            String maPhieuDep = String.format("#PNK-%d-%04d",
                    phieu.getNgayLapPhieu().getYear(),
                    phieu.getMaPhieuNK());
            res.setMaPhieu(maPhieuDep);

            res.setNgayNhap(phieu.getNgayLapPhieu());
            res.setNhaCungCap(phieu.getNhaCungCap() != null ? phieu.getNhaCungCap().getTenNCC() : "Không xác định");
            res.setNguoiLap(phieu.getNhanVien() != null ? phieu.getNhanVien().getHoTen() : "Không xác định");
            res.setTongTien(phieu.getTongTienThanhToan());

            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public BaoCaoKhoResponse layBaoCaoKho(LocalDate tuNgay, LocalDate denNgay) {

        LocalDateTime thoiGianBatDau = tuNgay.atStartOfDay();
        LocalDateTime thoiGianKetThuc = denNgay.atTime(LocalTime.MAX);

        List< NguyenVatLieu > danhSachNVL = nvlRepository.findAll();

        List< Object[] > dataNhapTrongKy = chiTietNhapKhoRepository.thongKeNhapTrongKy(thoiGianBatDau, thoiGianKetThuc);

        Map< String, Double > mapNhapTrongKy = new HashMap<>();
        for (Object[] row : dataNhapTrongKy) {
            String maNVL = (String) row[0];
            Double tongNhap = (Double) row[1];
            mapNhapTrongKy.put(maNVL, tongNhap);
        }

        Double tongNhapToanKho = 0.0;
        Double tongTonKhoHienTai = 0.0; // Biến mới cho Card 3
        List< BaoCaoKhoResponse.ChiTietBaoCao > dsBaoCao = new ArrayList<>();

        for (NguyenVatLieu nvl : danhSachNVL) {
            BaoCaoKhoResponse.ChiTietBaoCao chiTiet = new BaoCaoKhoResponse.ChiTietBaoCao();
            chiTiet.setMaNVL(nvl.getMaNVL());
            chiTiet.setTenNVL(nvl.getTenNVL());
            chiTiet.setDonVi(nvl.getDonVi());
            chiTiet.setTonKhoHienTai(nvl.getSoLuongTon());
            chiTiet.setTrangThai(nvl.getTrangThai());

            Double nhapKyNay = mapNhapTrongKy.getOrDefault(nvl.getMaNVL(), 0.0);
            chiTiet.setNhapTrongKy(nhapKyNay);

            tongNhapToanKho += nhapKyNay;
            tongTonKhoHienTai += nvl.getSoLuongTon(); // Cộng dồn số lượng tồn
            dsBaoCao.add(chiTiet);
        }

        BaoCaoKhoResponse response = new BaoCaoKhoResponse();
        // Bơm đủ 3 tham số cho 3 thẻ UI
        response.setTongMatHang((long) danhSachNVL.size());
        response.setTongNhapToanKho(tongNhapToanKho);
        response.setTongTonKhoHienTai(tongTonKhoHienTai);
        Double tongTienNhap = chiTietNhapKhoRepository.tongGiaTriNhapTrongKy(thoiGianBatDau, thoiGianKetThuc);
        response.setTongTienNhapTrongKy(tongTienNhap != null ? tongTienNhap : 0.0);
        response.setDanhSach(dsBaoCao);

        return response;
    }

    @Override
    public NguyenVatLieuResponse themNguyenVatLieu(NguyenVatLieuRequest request) {
        // 1. Kiểm tra trùng lặp tên
        if (nvlRepository.existsByTenNVLIgnoreCase(request.getTenNVL().trim())) {
            throw new IllegalArgumentException("Tên nguyên vật liệu này đã tồn tại!");
        }

        // 2. Tạo mã vật tư tự sinh (VD: NVL-A1B2C3)
        String maTuSinh = "NVL-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        NguyenVatLieu nvlMoi = new NguyenVatLieu();
        nvlMoi.setMaNVL(maTuSinh);
        nvlMoi.setTenNVL(request.getTenNVL().trim());
        nvlMoi.setDonVi(request.getDonVi());

        // Giá trị mặc định khi mới tạo
        nvlMoi.setSoLuongTon(0.0);
        nvlMoi.setTrangThai("Hết hàng");

        NguyenVatLieu saved = nvlRepository.save(nvlMoi);

        // Map ra Response trả về cho FE
        NguyenVatLieuResponse res = new NguyenVatLieuResponse();
        res.setMaNVL(saved.getMaNVL());
        res.setTenNVL(saved.getTenNVL());
        res.setDonVi(saved.getDonVi());
        res.setSoLuongTon(saved.getSoLuongTon());
        res.setTrangThai(saved.getTrangThai());
        return res;
    }

    @Override
    public NguyenVatLieuResponse suaNguyenVatLieu(String maNVL, NguyenVatLieuRequest request) {
        NguyenVatLieu nvlHienTai = nvlRepository.findById(maNVL)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên vật liệu này!"));

        // Cập nhật thông tin từ UI
        nvlHienTai.setTenNVL(request.getTenNVL().trim());
        nvlHienTai.setDonVi(request.getDonVi());

        NguyenVatLieu saved = nvlRepository.save(nvlHienTai);

        NguyenVatLieuResponse res = new NguyenVatLieuResponse();
        res.setMaNVL(saved.getMaNVL());
        res.setTenNVL(saved.getTenNVL());
        res.setDonVi(saved.getDonVi());
        res.setSoLuongTon(saved.getSoLuongTon());
        res.setTrangThai(saved.getTrangThai());
        return res;
    }

    @Override
    public void xoaNguyenVatLieu(String maNVL) {
        NguyenVatLieu nvl = nvlRepository.findById(maNVL)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên vật liệu này!"));

        // Ràng buộc thép: Đã nhập kho thì cấm xóa
        if (chiTietNhapKhoRepository.existsByNguyenVatLieu_MaNVL(maNVL)) {
            throw new IllegalArgumentException("Không thể xóa! Nguyên vật liệu này đã có dữ liệu nhập kho.");
        }

        nvlRepository.delete(nvl);
    }

    @Override
    public PhieuNhapChiTietResponse layChiTietPhieuNhap(Long id) {
        PhieuNhapKho phieu = phieuNhapKhoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu nhập"));
        
        PhieuNhapChiTietResponse res = new PhieuNhapChiTietResponse();
        res.setId(phieu.getMaPhieuNK());
        res.setMaPhieu(String.format("#PNK-%d-%04d", phieu.getNgayLapPhieu().getYear(), phieu.getMaPhieuNK()));
        res.setNgayNhap(phieu.getNgayLapPhieu());
        res.setSupplier(phieu.getNhaCungCap() != null ? phieu.getNhaCungCap().getMaNCC() : "");
        res.setSupplierName(phieu.getNhaCungCap() != null ? phieu.getNhaCungCap().getTenNCC() : "");
        res.setNguoiLap(phieu.getNhanVien() != null ? phieu.getNhanVien().getHoTen() : "");
        res.setReason(phieu.getLyDoNhap());
        res.setTotal(phieu.getTongTienThanhToan());
        
        List<ChiTietNhapKho> dsCT = chiTietNhapKhoRepository.findByPhieuNhapKho_MaPhieuNK(id);
        List<PhieuNhapChiTietResponse.ChiTietRow> rows = new ArrayList<>();
        long tempId = 1;
        for (ChiTietNhapKho ct : dsCT) {
            PhieuNhapChiTietResponse.ChiTietRow row = new PhieuNhapChiTietResponse.ChiTietRow();
            row.setId(tempId++);
            row.setMatName(ct.getNguyenVatLieu().getTenNVL());
            row.setUnit(ct.getNguyenVatLieu().getDonVi());
            row.setQuantity(ct.getSoLuong());
            row.setPrice(ct.getDonGia());
            rows.add(row);
        }
        res.setRows(rows);
        return res;
    }

    @Override
    @Transactional
    public String suaPhieuNhap(Long id, TaoPhieuNhapRequest request) {
        PhieuNhapKho phieu = phieuNhapKhoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu nhập"));
                
        // 1. Phục hồi số lượng tồn kho của các chi tiết cũ
        List<ChiTietNhapKho> dsCTCus = chiTietNhapKhoRepository.findByPhieuNhapKho_MaPhieuNK(id);
        for (ChiTietNhapKho ctCu : dsCTCus) {
            NguyenVatLieu nvl = ctCu.getNguyenVatLieu();
            nvl.setSoLuongTon(nvl.getSoLuongTon() - ctCu.getSoLuong());
            if (nvl.getSoLuongTon() <= 0) {
                nvl.setSoLuongTon(0.0);
                nvl.setTrangThai("Hết hàng");
            } else if (nvl.getSoLuongTon() < 5) {
                nvl.setTrangThai("Sắp hết");
            } else {
                nvl.setTrangThai("Còn hàng");
            }
            nvlRepository.save(nvl);
        }
        
        // 2. Xóa các chi tiết cũ
        chiTietNhapKhoRepository.deleteByPhieuNhapKho_MaPhieuNK(id);
        
        // 3. Cập nhật thông tin phiếu
        NhaCungCap ncc = nhaCungCapRepository.findById(request.getMaNCC())
                .orElseThrow(() -> new IllegalArgumentException("Nhà cung cấp không tồn tại"));
        phieu.setNhaCungCap(ncc);
        phieu.setLyDoNhap(request.getLyDoNhap());
        phieu.setTongTienThanhToan(request.getTongTienThanhToan());
        phieuNhapKhoRepository.save(phieu);
        
        // 4. Thêm chi tiết mới và cập nhật tồn kho
        for (TaoPhieuNhapRequest.ChiTietNhap itemReq : request.getDanhSachHang()) {
            NguyenVatLieu nvl = nvlRepository.findById(itemReq.getMaNVL())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên vật liệu"));
                    
            ChiTietNhapKho chiTiet = new ChiTietNhapKho();
            chiTiet.setPhieuNhapKho(phieu);
            chiTiet.setNguyenVatLieu(nvl);
            chiTiet.setSoLuong(itemReq.getSoLuong());
            chiTiet.setDonGia(itemReq.getDonGia());
            chiTietNhapKhoRepository.save(chiTiet);
            
            nvl.setSoLuongTon(nvl.getSoLuongTon() + itemReq.getSoLuong());
            nvl.setTrangThai("Còn hàng");
            nvlRepository.save(nvl);
        }
        
        return "Cập nhật phiếu nhập thành công!";
    }

    @Override
    @Transactional
    public void xoaPhieuNhap(Long id) {
        PhieuNhapKho phieu = phieuNhapKhoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu nhập"));
                
        // 1. Trừ tồn kho
        List<ChiTietNhapKho> dsCTCus = chiTietNhapKhoRepository.findByPhieuNhapKho_MaPhieuNK(id);
        for (ChiTietNhapKho ctCu : dsCTCus) {
            NguyenVatLieu nvl = ctCu.getNguyenVatLieu();
            nvl.setSoLuongTon(nvl.getSoLuongTon() - ctCu.getSoLuong());
            if (nvl.getSoLuongTon() <= 0) {
                nvl.setSoLuongTon(0.0);
                nvl.setTrangThai("Hết hàng");
            } else if (nvl.getSoLuongTon() < 5) {
                nvl.setTrangThai("Sắp hết");
            }
            nvlRepository.save(nvl);
        }
        
        // 2. Xóa chi tiết
        chiTietNhapKhoRepository.deleteByPhieuNhapKho_MaPhieuNK(id);
        
        // 3. Xóa phiếu
        phieuNhapKhoRepository.delete(phieu);
    }
}