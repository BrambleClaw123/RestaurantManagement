package com.example.qlnh.service.impl;

import com.example.qlnh.converter.NhaCungCapConverter;
import com.example.qlnh.dto.request.NhaCungCapRequest;
import com.example.qlnh.dto.response.NhaCungCapResponse;
import com.example.qlnh.dto.response.ThongKeNccResponse;
import com.example.qlnh.entity.NhaCungCap;
import com.example.qlnh.repository.NhaCungCapRepository;
import com.example.qlnh.service.NhaCungCapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NhaCungCapServiceImpl implements NhaCungCapService {

    @Autowired
    private NhaCungCapRepository repository;

    @Autowired
    private NhaCungCapConverter converter;

    @Override
    public List<NhaCungCapResponse> layDanhSach(String keyword) {
        String finalKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        return repository.timKiemNhaCungCap(finalKeyword).stream()
                .map(converter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ThongKeNccResponse layThongKe() {
        return ThongKeNccResponse.builder()
                .tongSoDoiTac(repository.count())
                .build();
    }

    @Override
    public NhaCungCapResponse layChiTiet(String maNCC) {
        NhaCungCap ncc = repository.findById(maNCC)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhà cung cấp"));
        return converter.toResponse(ncc);
    }

    @Override
    public NhaCungCapResponse themNhaCungCap(NhaCungCapRequest request) {
        String tenNCC = request.getTenNCC() != null ? request.getTenNCC().trim() : "";
        String soDienThoai = request.getSoDienThoai() != null ? request.getSoDienThoai().trim() : "";

        // 1. Kiểm tra trùng tên
        if (repository.existsByTenNCCIgnoreCase(tenNCC)) {
            throw new IllegalArgumentException("Tên nhà cung cấp này đã tồn tại trong hệ thống!");
        }

        // 2. Kiểm tra định dạng số điện thoại (Bắt đầu bằng 0, gồm đúng 10 chữ số)
        if (!soDienThoai.matches("^0\\d{9}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số");
        }

        // 3. Kiểm tra trùng số điện thoại
        if (repository.existsBySoDienThoai(soDienThoai)) {
            throw new IllegalArgumentException("Số điện thoại này đã được đăng ký cho một nhà cung cấp khác!");
        }

        NhaCungCap ncc = new NhaCungCap();

        // Tự động sinh mã (VD: NCC17130283021)
        ncc.setMaNCC("NCC" + System.currentTimeMillis());

        ncc.setTenNCC(tenNCC);
        ncc.setSoDienThoai(soDienThoai);

        return converter.toResponse(repository.save(ncc));
    }

    @Override
    public NhaCungCapResponse capNhatNhaCungCap(String maNCC, NhaCungCapRequest request) {
        // 1. Tìm nhà cung cấp trong DB trước
        NhaCungCap nccHienTai = repository.findById(maNCC)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhà cung cấp"));

        String tenNCC = request.getTenNCC() != null ? request.getTenNCC().trim() : "";
        String soDienThoai = request.getSoDienThoai() != null ? request.getSoDienThoai().trim() : "";

        // 2. Kiểm tra trùng tên (Loại trừ chính nhà cung cấp đang sửa)
        if (repository.existsByTenNCCIgnoreCaseAndMaNCCNot(tenNCC, maNCC)) {
            throw new IllegalArgumentException("Tên nhà cung cấp này đã tồn tại trong hệ thống!");
        }

        // 3. Kiểm tra định dạng số điện thoại
        if (!soDienThoai.matches("^0\\d{9}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số và bắt đầu bằng số 0.");
        }

        // 4. Kiểm tra trùng số điện thoại (Loại trừ chính nhà cung cấp đang sửa)
        if (repository.existsBySoDienThoaiAndMaNCCNot(soDienThoai, maNCC)) {
            throw new IllegalArgumentException("Số điện thoại này đã được đăng ký cho một nhà cung cấp khác!");
        }

        // 5. Nếu vượt qua mọi bài kiểm tra thì mới cập nhật dữ liệu
        nccHienTai.setTenNCC(tenNCC);
        nccHienTai.setSoDienThoai(soDienThoai);

        return converter.toResponse(repository.save(nccHienTai));
    }
}