package com.example.qlnh.chat;

import com.example.qlnh.dto.response.*;
import com.example.qlnh.dto.response.baocao.BaoCaoBanChayResponse;
import com.example.qlnh.dto.response.baocao.BaoCaoDoanhThuResponse;
import com.example.qlnh.service.BanAnService;
import com.example.qlnh.service.BaoCaoService;
import com.example.qlnh.service.BepService;
import com.example.qlnh.service.KhoService;
import com.example.qlnh.service.MonAnService;
import com.example.qlnh.service.NhanVienService;
import com.example.qlnh.service.TaiKhoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;

/**
 * Các "công cụ" (function calling) mà Gemini được phép gọi.
 * - Tất cả chỉ ĐỌC dữ liệu, không có thao tác thêm/sửa/xóa.
 * - ADMIN chỉ được xem nhân viên và tài khoản (không xem nghiệp vụ nhà hàng).
 * - Mỗi công cụ có danh sách vai trò được phép; kiểm tra ở cả 2 nơi:
 *   (1) chỉ khai báo cho Gemini những công cụ hợp vai trò,
 *   (2) kiểm tra lại khi thực thi (phòng trường hợp model gọi bừa).
 * - Dữ liệu trả về là các Map do ta chọn trường, không lộ dữ liệu thừa.
 */
@Component
public class ChatTools {

    private static final Set<String> TAT_CA = Set.of("DAU_BEP", "PHUC_VU", "LE_TAN", "NHAN_VIEN_KHO", "QUAN_LY");
    private static final Set<String> QUAN_LY_ONLY = Set.of("QUAN_LY");
    private static final Set<String> ADMIN_ONLY = Set.of("ADMIN");
    private static final int MAX_ROWS = 40;

    @Autowired private MonAnService monAnService;
    @Autowired private BanAnService banAnService;
    @Autowired private BepService bepService;
    @Autowired private KhoService khoService;
    @Autowired private BaoCaoService baoCaoService;
    @Autowired private NhanVienService nhanVienService;
    @Autowired private TaiKhoanService taiKhoanService;

    private record Tool(String name, String description, Map<String, Object> parameters,
                        Set<String> roles, Function<Map<String, Object>, Map<String, Object>> handler) { }

    private final Map<String, Tool> tools = new LinkedHashMap<>();

    public ChatTools() {
        register(new Tool("xem_thuc_don",
                "Tra cứu thực đơn: tên món, loại món, đơn giá, tình trạng phục vụ. Có thể lọc theo từ khóa và loại món.",
                params(Map.of(
                        "tu_khoa", prop("STRING", "Từ khóa trong tên món (tùy chọn)"),
                        "loai_mon", prop("STRING", "Một trong: MON_CHINH, LAU_NUONG, MON_KHAI_VI, TRANG_MIENG, THUC_UONG (tùy chọn)")
                ), List.of()),
                TAT_CA, this::xemThucDon));

        register(new Tool("thong_ke_thuc_don",
                "Thống kê nhanh thực đơn: tổng số món, số món đang phục vụ, số món tạm ngưng, đơn giá trung bình.",
                null, TAT_CA, a -> {
            ThongKeMonAnResponse r = monAnService.layThongKe();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("tongSoMon", r.getTongSoMon());
            m.put("soMonConPhucVu", r.getSoMonConPhucVu());
            m.put("soMonTamNgung", r.getSoMonTamNgung());
            m.put("donGiaTrungBinh", r.getDonGiaTrungBinh());
            return m;
        }));

        register(new Tool("xem_trang_thai_ban",
                "Xem tình trạng các bàn ăn: bàn nào đang trống, bàn nào đang có khách, số chỗ ngồi.",
                null, Set.of("PHUC_VU", "LE_TAN", "QUAN_LY"), a -> xemBan()));

        register(new Tool("xem_don_bep",
                "Xem các order đang ở bếp: bàn nào, món gì, số lượng, ghi chú, trạng thái.",
                null, Set.of("DAU_BEP", "QUAN_LY"), a -> xemDonBep()));

        register(new Tool("xem_ton_kho",
                "Xem tồn kho nguyên vật liệu và thống kê kho (sắp hết, đã hết). Có thể lọc theo từ khóa tên nguyên liệu.",
                params(Map.of("tu_khoa", prop("STRING", "Từ khóa tên nguyên liệu (tùy chọn)")), List.of()),
                Set.of("NHAN_VIEN_KHO", "QUAN_LY"), this::xemTonKho));

        register(new Tool("xem_nhan_vien",
                "Tra cứu danh sách nhân viên: mã, họ tên, vai trò, số điện thoại, tài khoản liên kết. Có thể lọc theo từ khóa.",
                params(Map.of("tu_khoa", prop("STRING", "Từ khóa tên hoặc mã nhân viên (tùy chọn)")), List.of()),
                ADMIN_ONLY, this::xemNhanVien));

        register(new Tool("xem_tai_khoan",
                "Tra cứu tài khoản đăng nhập: tên đăng nhập, nhân viên sở hữu, vai trò, đang hoạt động hay bị khóa. Có thể lọc theo từ khóa.",
                params(Map.of("tu_khoa", prop("STRING", "Từ khóa tên đăng nhập hoặc tên nhân viên (tùy chọn)")), List.of()),
                ADMIN_ONLY, this::xemTaiKhoan));

        Map<String, Object> khoangNgay = params(Map.of(
                "tu_ngay", prop("STRING", "Ngày bắt đầu, định dạng yyyy-MM-dd"),
                "den_ngay", prop("STRING", "Ngày kết thúc, định dạng yyyy-MM-dd")
        ), List.of("tu_ngay", "den_ngay"));

        register(new Tool("bao_cao_doanh_thu",
                "Báo cáo doanh thu trong một khoảng ngày: tổng doanh thu, số hóa đơn, giá trị trung bình, thực thu sau thuế, chi tiết theo ngày.",
                khoangNgay, QUAN_LY_ONLY, this::baoCaoDoanhThu));

        register(new Tool("bao_cao_mon_ban_chay",
                "Báo cáo món bán chạy trong một khoảng ngày: món bán chạy nhất, số phần đã bán, doanh thu từng món.",
                khoangNgay, QUAN_LY_ONLY, this::baoCaoBanChay));
    }

    // ------------------------------------------------------------------ API cho ChatService

    /** Khai báo công cụ gửi cho Gemini, chỉ gồm công cụ hợp với vai trò. */
    public List<Map<String, Object>> declarationsFor(Set<String> roles) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Tool t : tools.values()) {
            if (!Collections.disjoint(t.roles(), roles)) {
                Map<String, Object> d = new LinkedHashMap<>();
                d.put("name", t.name());
                d.put("description", t.description());
                if (t.parameters() != null) d.put("parameters", t.parameters());
                out.add(d);
            }
        }
        return out;
    }

    /** Thực thi công cụ; luôn trả về Map (Gemini yêu cầu functionResponse là object). */
    public Map<String, Object> execute(String name, Map<String, Object> args, Set<String> roles) {
        Tool t = tools.get(name);
        if (t == null) return Map.of("loi", "Công cụ không tồn tại: " + name);
        if (Collections.disjoint(t.roles(), roles)) {
            return Map.of("loi", "Vai trò hiện tại không có quyền xem thông tin này.");
        }
        try {
            return t.handler().apply(args == null ? Map.of() : args);
        } catch (Exception e) {
            return Map.of("loi", "Không lấy được dữ liệu: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------ Xử lý từng công cụ

    private Map<String, Object> xemThucDon(Map<String, Object> a) {
        List<MonAnResponse> ds = monAnService.layDanhSach(str(a, "tu_khoa"), str(a, "loai_mon"));
        List<Map<String, Object>> rows = new ArrayList<>();
        for (MonAnResponse m : ds) {
            if (rows.size() >= MAX_ROWS) break;
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("tenMon", m.getTenMon());
            r.put("loaiMon", m.getLoaiMon() == null ? null : m.getLoaiMon().getGiaTri());
            r.put("donViTinh", m.getDonViTinh() == null ? null : m.getDonViTinh().getGiaTri());
            r.put("donGia", m.getDonGia());
            r.put("trangThai", m.getTrangThai());
            rows.add(r);
        }
        return Map.of("tongSoKetQua", ds.size(), "danhSach", rows);
    }

    private Map<String, Object> xemBan() {
        List<BanAnResponse> ds = banAnService.layTatCaBan();
        Map<String, Integer> demTheoTrangThai = new LinkedHashMap<>();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (BanAnResponse b : ds) {
            demTheoTrangThai.merge(String.valueOf(b.getTrangThai()), 1, Integer::sum);
            if (rows.size() < MAX_ROWS * 2) {
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("tenBan", b.getTenBan());
                r.put("soCho", b.getSoCho());
                r.put("trangThai", b.getTrangThai());
                rows.add(r);
            }
        }
        return Map.of("tongSoBan", ds.size(), "demTheoTrangThai", demTheoTrangThai, "danhSach", rows);
    }

    private Map<String, Object> xemDonBep() {
        List<BepOrderResponse> ds = bepService.layDanhSachOrder();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (BepOrderResponse o : ds) {
            if (rows.size() >= MAX_ROWS) break;
            List<Map<String, Object>> mon = new ArrayList<>();
            if (o.getDanhSachMon() != null) {
                for (BepMonResponse m : o.getDanhSachMon()) {
                    Map<String, Object> mm = new LinkedHashMap<>();
                    mm.put("tenMon", m.getTenMon());
                    mm.put("soLuong", m.getSoLuong());
                    mm.put("ghiChu", m.getGhiChu());
                    mon.add(mm);
                }
            }
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("maBan", o.getMaBan());
            r.put("maPhieu", o.getMaPhieuHienThi());
            r.put("thoiGian", o.getThoiGian());
            r.put("trangThai", o.getTrangThai());
            r.put("danhSachMon", mon);
            rows.add(r);
        }
        return Map.of("soOrder", ds.size(), "danhSach", rows);
    }

    private Map<String, Object> xemTonKho(Map<String, Object> a) {
        KhoThongKeResponse tk = khoService.layThongKe();
        List<NguyenVatLieuResponse> ds = khoService.layDanhSachNVL(str(a, "tu_khoa"));
        List<Map<String, Object>> rows = new ArrayList<>();
        for (NguyenVatLieuResponse n : ds) {
            if (rows.size() >= MAX_ROWS) break;
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("tenNVL", n.getTenNVL());
            r.put("donVi", n.getDonVi());
            r.put("soLuongTon", n.getSoLuongTon());
            r.put("trangThai", n.getTrangThai());
            rows.add(r);
        }
        Map<String, Object> thongKe = new LinkedHashMap<>();
        thongKe.put("tongMatHang", tk.getTongMatHang());
        thongKe.put("conHangOnDinh", tk.getConHangOnDinh());
        thongKe.put("sapHetHang", tk.getSapHetHang());
        thongKe.put("daHetHang", tk.getDaHetHang());
        return Map.of("thongKe", thongKe, "tongSoKetQua", ds.size(), "danhSach", rows);
    }

    private Map<String, Object> xemNhanVien(Map<String, Object> a) {
        List<NhanVienResponse> ds = nhanVienService.layDanhSachNhanVien(str(a, "tu_khoa"));
        Map<String, Integer> demTheoVaiTro = new LinkedHashMap<>();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (NhanVienResponse n : ds) {
            demTheoVaiTro.merge(n.getVaiTro() == null ? "Chưa rõ" : n.getVaiTro().getGiaTri(), 1, Integer::sum);
            if (rows.size() < MAX_ROWS) {
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("maNV", n.getMaNV());
                r.put("hoTen", n.getHoTen());
                r.put("vaiTro", n.getVaiTro() == null ? null : n.getVaiTro().getGiaTri());
                r.put("soDienThoai", n.getSoDienThoai());
                r.put("coTaiKhoan", n.getTaiKhoanLienKet() != null);
                rows.add(r);
            }
        }
        return Map.of("tongSoKetQua", ds.size(), "demTheoVaiTro", demTheoVaiTro, "danhSach", rows);
    }

    // TUYỆT ĐỐI không đưa mật khẩu (matKhau) vào kết quả trả cho chatbot.
    private Map<String, Object> xemTaiKhoan(Map<String, Object> a) {
        List<TaiKhoanResponse> ds = taiKhoanService.layDanhSachTaiKhoan(str(a, "tu_khoa"));
        int hoatDong = 0, biKhoa = 0;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TaiKhoanResponse t : ds) {
            boolean active = t.getTrangThai() != null && t.getTrangThai() == 1;
            if (active) hoatDong++; else biKhoa++;
            if (rows.size() < MAX_ROWS) {
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("maNV", t.getMaNV());
                r.put("tenDangNhap", t.getTenDangNhap());
                r.put("hoTenNhanVien", t.getHoTenNhanVien());
                r.put("vaiTro", t.getVaiTro() == null ? null : t.getVaiTro().getGiaTri());
                r.put("trangThai", active ? "Đang hoạt động" : "Bị khóa");
                rows.add(r);
            }
        }
        return Map.of("tongSoKetQua", ds.size(), "dangHoatDong", hoatDong, "biKhoa", biKhoa, "danhSach", rows);
    }

    private Map<String, Object> baoCaoDoanhThu(Map<String, Object> a) {
        LocalDate tu = date(a, "tu_ngay");
        LocalDate den = date(a, "den_ngay");
        BaoCaoDoanhThuResponse r = baoCaoService.layBaoCaoDoanhThu(tu.atStartOfDay(), den.atTime(LocalTime.MAX));
        Map<String, Object> tq = new LinkedHashMap<>();
        if (r.getTongQuan() != null) {
            tq.put("tongDoanhThu", r.getTongQuan().getTongDoanhThu());
            tq.put("tongHoaDon", r.getTongQuan().getTongHoaDon());
            tq.put("giaTriTrungBinhDon", r.getTongQuan().getGiaTriTrungBinhDon());
            tq.put("thucThuSauThue", r.getTongQuan().getThucThuSauThue());
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        if (r.getChiTietDanhSach() != null) {
            for (BaoCaoDoanhThuResponse.ChiTiet c : r.getChiTietDanhSach()) {
                if (rows.size() >= 62) break;
                Map<String, Object> x = new LinkedHashMap<>();
                x.put("ngay", c.getNgayHoatDong());
                x.put("soDon", c.getSoLuongDon());
                x.put("doanhSo", c.getDoanhSoBan());
                x.put("thucThu", c.getThucThu());
                rows.add(x);
            }
        }
        return Map.of("tuNgay", tu.toString(), "denNgay", den.toString(), "tongQuan", tq, "chiTietTheoNgay", rows);
    }

    private Map<String, Object> baoCaoBanChay(Map<String, Object> a) {
        LocalDate tu = date(a, "tu_ngay");
        LocalDate den = date(a, "den_ngay");
        BaoCaoBanChayResponse r = baoCaoService.layBaoCaoBanChay(tu.atStartOfDay(), den.atTime(LocalTime.MAX));
        Map<String, Object> tq = new LinkedHashMap<>();
        if (r.getTongQuan() != null) {
            tq.put("monBanChayNhat", r.getTongQuan().getMonBanChayNhat());
            tq.put("tongSoPhanDaBan", r.getTongQuan().getTongSoPhanDaBan());
            tq.put("tongDoanhThuMon", r.getTongQuan().getTongDoanhThuMon());
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        if (r.getChiTietDanhSach() != null) {
            for (BaoCaoBanChayResponse.ChiTiet c : r.getChiTietDanhSach()) {
                if (rows.size() >= MAX_ROWS) break;
                Map<String, Object> x = new LinkedHashMap<>();
                x.put("tenMon", c.getTenMon());
                x.put("loaiMon", c.getLoaiMon());
                x.put("soLuongBan", c.getSoLuongBan());
                x.put("tongTien", c.getTongTienThuDuoc());
                rows.add(x);
            }
        }
        return Map.of("tuNgay", tu.toString(), "denNgay", den.toString(), "tongQuan", tq, "danhSach", rows);
    }

    // ------------------------------------------------------------------ Tiện ích

    private void register(Tool t) {
        tools.put(t.name(), t);
    }

    private static Map<String, Object> prop(String type, String description) {
        return Map.of("type", type, "description", description);
    }

    private static Map<String, Object> params(Map<String, Object> properties, List<String> required) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("type", "OBJECT");
        p.put("properties", properties);
        if (!required.isEmpty()) p.put("required", required);
        return p;
    }

    private static String str(Map<String, Object> a, String key) {
        Object v = a.get(key);
        return v == null ? null : v.toString();
    }

    private static LocalDate date(Map<String, Object> a, String key) {
        String s = str(a, key);
        if (s == null) throw new IllegalArgumentException("Thiếu tham số " + key);
        return LocalDate.parse(s.trim());
    }
}
