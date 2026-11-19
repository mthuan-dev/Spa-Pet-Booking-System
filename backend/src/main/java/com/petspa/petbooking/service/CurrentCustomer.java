package com.petspa.petbooking.service;

import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.repository.NguoiDungRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CurrentCustomer {
    private final NguoiDungRepository users;
    public CurrentCustomer(NguoiDungRepository users) { this.users = users; }
    public NguoiDung require(Jwt jwt) {
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var user = users.findByEmail(jwt.getSubject()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (user.getVaiTro() != VaiTro.CUSTOMER || !Integer.valueOf(1).equals(user.getTrangThai()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản khách hàng không hoạt động.");
        return user;
    }
}
