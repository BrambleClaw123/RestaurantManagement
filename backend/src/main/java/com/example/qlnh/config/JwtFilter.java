package com.example.qlnh.config;

import com.example.qlnh.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String tenDangNhap;

        // Bỏ qua nếu không có Header Authorization hoặc không bắt đầu bằng "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Cắt bỏ chữ "Bearer " để lấy đúng chuỗi mã Token
        jwt = authHeader.substring(7);

        // Bắt lỗi Token hết hạn hoặc không hợp lệ tại đây,
        // tránh để Exception nổi lên thành lỗi 500 ở DispatcherServlet
        try {
            tenDangNhap = jwtUtil.extractTenDangNhap(jwt);
        } catch (ExpiredJwtException e) {
            // Token hết hạn → trả 401 để FE tự redirect về Login
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"status\": 401, \"message\": \"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.\"}");
            return;
        } catch (Exception e) {
            // Token sai định dạng hoặc bị giả mạo → cũng trả 401
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"status\": 401, \"message\": \"Token không hợp lệ.\"}");
            return;
        }

        // Nếu có tên đăng nhập và chưa được xác thực trong ngữ cảnh hiện tại
        if (tenDangNhap != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.isTokenValid(jwt, tenDangNhap)) {

                // Đọc Role từ Token (Sẽ lấy ra được chuỗi "ROLE_QUAN_LY" hoặc "ROLE_DAU_BEP")
                String role = jwtUtil.extractRole(jwt);
                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

                // Cấp quyền vào biến authToken
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        tenDangNhap, null, authorities
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}