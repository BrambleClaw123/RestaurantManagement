package com.example.qlnh.converter;

import com.example.qlnh.enums.VaiTro;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true) // autoApply = true giúp tự động chuyển đổi ở mọi nơi
public class VaiTroDbConverter implements AttributeConverter<VaiTro, String> {

    @Override
    public String convertToDatabaseColumn(VaiTro vaiTro) {
        if (vaiTro == null) return null;
        return vaiTro.getGiaTri(); // Lưu chuỗi tiếng Việt (VD: "Lễ tân") xuống Database
    }

    @Override
    public VaiTro convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;

        // Quét tìm Enum tương ứng với chuỗi tiếng Việt lấy từ Database lên
        for (VaiTro v : VaiTro.values()) {
            if (v.getGiaTri().equalsIgnoreCase(dbData)) {
                return v;
            }
        }

        // Báo lỗi cứng nếu dữ liệu trong DB bị ai đó sửa bậy bằng tay
        throw new IllegalArgumentException("Lỗi dữ liệu DB: Không nhận diện được vai trò '" + dbData + "'");
    }
}