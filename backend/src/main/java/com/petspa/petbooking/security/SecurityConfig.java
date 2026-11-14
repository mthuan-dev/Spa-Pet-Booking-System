package com.petspa.petbooking.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF (thường làm khi dùng REST API với JWT)
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập tự do vào các API bắt đầu bằng /api/auth (như login, register)
                        .requestMatchers("/api/**").permitAll()

                        // Mở tạm toàn bộ API để test (Nếu bạn đang code dở, chưa làm xong phần login)
                        // .requestMatchers("/**").permitAll()

                        // Bắt buộc phải xác thực (đăng nhập) với các request còn lại
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}