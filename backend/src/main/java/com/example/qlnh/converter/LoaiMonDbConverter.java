package com.example.qlnh.converter;

import com.example.qlnh.enums.LoaiMon;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class LoaiMonDbConverter implements AttributeConverter<LoaiMon, String> {

    @Override
    public String convertToDatabaseColumn(LoaiMon loaiMon) {
        if (loaiMon == null) return null;
        return loaiMon.getGiaTri();
    }

    @Override
    public LoaiMon convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;

        for (LoaiMon l : LoaiMon.values()) {
            if (l.getGiaTri().equalsIgnoreCase(dbData) ||
                    // Xử lý linh hoạt lỡ trong DB đang lưu chữ "Món lẩu & nướng"
                    (dbData.equalsIgnoreCase("Món lẩu & nướng") && l == LoaiMon.LAU_NUONG)) {
                return l;
            }
        }
        throw new IllegalArgumentException("Lỗi dữ liệu DB: Không nhận diện được loại món '" + dbData + "'");
    }
}