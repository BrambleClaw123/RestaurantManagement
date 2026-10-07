package com.example.qlnh.converter;

import com.example.qlnh.enums.DonViTinh;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DonViTinhDbConverter implements AttributeConverter<DonViTinh, String> {

    @Override
    public String convertToDatabaseColumn(DonViTinh donViTinh) {
        if (donViTinh == null) return null;
        return donViTinh.getGiaTri();
    }

    @Override
    public DonViTinh convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;

        for (DonViTinh d : DonViTinh.values()) {
            if (d.getGiaTri().equalsIgnoreCase(dbData)) {
                return d;
            }
        }
        throw new IllegalArgumentException("Lỗi dữ liệu DB: Không nhận diện được đơn vị tính '" + dbData + "'");
    }
}