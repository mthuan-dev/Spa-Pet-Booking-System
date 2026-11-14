package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.request.AuthenticationRequest;
import com.petspa.petbooking.repository.NguoiDungRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationService {
    NguoiDungRepository nguoiDungRepository;
   public boolean Authenticated(AuthenticationRequest request){
        var user = nguoiDungRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not existed"));
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        return passwordEncoder.matches(request.getPassword(), user.getMatKhau());
    }
}
