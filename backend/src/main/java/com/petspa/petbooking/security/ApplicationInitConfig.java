package com.petspa.petbooking.security;

import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.enums.NhaCungCap;
import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.repository.NguoiDungRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    @Autowired
    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(NguoiDungRepository nguoiDungRepository){
        return args -> {
            if (nguoiDungRepository.findByEmail("admin@gmail.com").isEmpty()){
                NguoiDung user = NguoiDung.builder()
                        .email("admin@gmail.com")
                        .matKhau(passwordEncoder.encode("admin123"))
                        .nhaCungCap(NhaCungCap.LOCAL)
                        .ngayTao(LocalDateTime.now())
                        .hoTen("Admin")
                        .vaiTro(VaiTro.ADMIN)
                        .build();
                nguoiDungRepository.save(user);
                log.warn("admin user has been created with default password:admin123");
            }
        };
    }
}
