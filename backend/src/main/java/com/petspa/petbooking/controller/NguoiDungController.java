package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.NguoiDungCreationRequest;
import com.petspa.petbooking.dto.request.NguoiDungUpdateRequest;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.service.NguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class NguoiDungController {
    @Autowired
    NguoiDungService nguoiDungService;
    @PostMapping
    NguoiDungResponse createUser(@RequestBody NguoiDungCreationRequest request){
       return nguoiDungService.createUser(request);
    }
    @PutMapping("/{id}")
    NguoiDungResponse updateUser(@PathVariable("id") int id, @RequestBody NguoiDungUpdateRequest request){
        return nguoiDungService.updateUser(id,request);
    }
    @GetMapping
    List<NguoiDung> getallUser(){
        return nguoiDungService.getallUser();
    }
    @GetMapping("/{id}")
    NguoiDungResponse getUser(@PathVariable("id") int id){
        return nguoiDungService.getUser(id);
    }

}
