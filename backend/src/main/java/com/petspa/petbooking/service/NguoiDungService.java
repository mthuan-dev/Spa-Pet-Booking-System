package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.request.NguoiDungCreationRequest;
import com.petspa.petbooking.dto.request.NguoiDungUpdateRequest;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.mapper.NguoidungMapper;
import com.petspa.petbooking.repository.NguoiDungRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class NguoiDungService {
     NguoiDungRepository nguoiDungRepository;
     NguoidungMapper nguoidungMapper;
    public NguoiDungResponse createUser(NguoiDungCreationRequest request)
    {
        NguoiDung user = new NguoiDung();
        user=nguoidungMapper.toUser(request);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
       return nguoidungMapper.toUserResponse(nguoiDungRepository.save(user));

    }
    public NguoiDungResponse updateUser(int id,NguoiDungUpdateRequest request){
        NguoiDung user = nguoiDungRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        nguoidungMapper.updateUser(user,request);
        return nguoidungMapper.toUserResponse(nguoiDungRepository.save(user));
    }
    public NguoiDungResponse getUser(int id)
    {
        return nguoidungMapper.toUserResponse(nguoiDungRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found")));
    }
    public List<NguoiDung> getallUser(){
        return nguoiDungRepository.findAll();
    }
}

