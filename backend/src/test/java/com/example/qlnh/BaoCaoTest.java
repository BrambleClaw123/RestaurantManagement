package com.example.qlnh;

import com.example.qlnh.service.BaoCaoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.time.LocalDateTime;

@SpringBootTest
class BaoCaoTest {

    @Autowired
    private BaoCaoService baoCaoService;

    @Test
    void testBaoCaoBanChay() {
        try {
            var res = baoCaoService.layBaoCaoBanChay(LocalDateTime.of(2026, 1, 1, 0, 0), LocalDateTime.of(2026, 12, 31, 23, 59));
            System.out.println("API Success!");
            System.out.println("TongQuan: " + res.getTongQuan());
            System.out.println("ChiTiet: " + res.getChiTietDanhSach());
        } catch (Exception e) {
            System.err.println("API Failed!");
            e.printStackTrace();
        }
    }
}
