package com.petspa.petbooking.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.petspa.petbooking.dto.request.AuthenticationRequest;
import com.petspa.petbooking.dto.request.IntrospectRequest;
import com.petspa.petbooking.dto.request.RegisterRequest;
import com.petspa.petbooking.dto.response.AuthenticationResponse;
import com.petspa.petbooking.dto.response.IntrospectResponse;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.enums.NhaCungCap;
import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.mapper.NguoidungMapper;
import com.petspa.petbooking.repository.NguoiDungRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationService {
    NguoiDungRepository nguoiDungRepository;
    private final NguoidungMapper nguoidungMapper;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;
   public AuthenticationResponse Authenticated(AuthenticationRequest request){
        var user = nguoiDungRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác."));
        if (!Integer.valueOf(1).equals(user.getTrangThai()) || user.getMatKhau() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản không hợp lệ.");
        }
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        boolean result = passwordEncoder.matches(request.getPassword(), user.getMatKhau());
        if(!result)
        {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác.");
        }
        else{
            var AccessToken = generateToken(user);

            return AuthenticationResponse.builder()
                    .authentication(true)
                    .token(AccessToken)
                    .user(nguoidungMapper.toUserResponse(user))
                    .build();
        }

    }
    public NguoiDungResponse Register(RegisterRequest request){
       if(nguoiDungRepository.findByEmail(request.getEmail()).isPresent())
       {
           throw new IllegalArgumentException("Email đã tồn tại");
       }
       NguoiDung user = new NguoiDung();
       user.setHoTen(request.getFullname());
       user.setEmail(request.getEmail());
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setMatKhau(
                passwordEncoder.encode(request.getPassword())
        );
        user.setSoDienThoai(request.getPhone());
        user.setVaiTro(VaiTro.CUSTOMER);
        user.setNhaCungCap(NhaCungCap.LOCAL);
        user.setTrangThai(1);
        user.setNgayTao(LocalDateTime.now());
        return nguoidungMapper.toUserResponse(nguoiDungRepository.save(user));
    }
    private String generateToken(NguoiDung user){
        JWSHeader header= new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .claim("userId", user.getMaNguoiDung())
                .issuer("Spa-Pet")
                .issueTime(new Date())
                .claim("scope",buildScope(user))
                .expirationTime(new Date(Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()))
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header,payload);
        try {
        jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
        return jwsObject.serialize();
        }
        catch (JOSEException e){
            throw new RuntimeException(e);
        }
    }
    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException {
       var token = request.getToken();
       JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT =  SignedJWT.parse(token);

        var claims = signedJWT.getJWTClaimsSet();
        var tokenScope = claims.getStringClaim("scope");
        Date expriredtime = claims.getExpirationTime();
        var verified = signedJWT.verify(verifier);
        boolean active = verified && expriredtime != null && expriredtime.after(new Date())
                && nguoiDungRepository.findByEmail(claims.getSubject())
                    .filter(user -> Integer.valueOf(1).equals(user.getTrangThai())
                            && user.getVaiTro().name().equals(tokenScope))
                    .isPresent();

        return IntrospectResponse.builder()
                .valid(active)
                .build();



    }
    private String buildScope(NguoiDung user){
        // scope : ADMIN || CUSTOMER
        return  user.getVaiTro().name();

    }

}
