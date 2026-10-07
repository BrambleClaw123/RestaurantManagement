package com.example.qlnh.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    // Đoạn mã bí mật để ký token (Phải dài tối thiểu 256-bit). Trong thực tế nên để ở file application.properties
    private final String SECRET_KEY = "076bcbe965246a84f593ad429e9141a92935969120c7fe1bd3d2224dc5827335";

    // Thời gian sống của token: 24 giờ (tính bằng mili-giây)
    private final long JWT_EXPIRATION = 1000 * 60 * 60 * 24;

    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // 1. Hàm tạo Token khi user đăng nhập thành công
    public String generateToken(String tenDangNhap, String vaiTro, String maNV) {
        Map claims = new HashMap<>();
        claims.put("role", "ROLE_" + vaiTro);
        claims.put("maNV", maNV); 

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(tenDangNhap)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractMaNV(String token) {
        return extractClaim(token, claims -> claims.get("maNV", String.class));
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // 2. Lấy Tên đăng nhập từ Token
    public String extractTenDangNhap(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 3. Kiểm tra Token còn hạn và có khớp tên đăng nhập không
    public boolean isTokenValid(String token, String tenDangNhap) {
        final String username = extractTenDangNhap(token);
        return (username.equals(tenDangNhap)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}