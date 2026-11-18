package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.NguoiDungCreationRequest;
import com.petspa.petbooking.dto.request.NguoiDungUpdateRequest;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.service.NguoiDungService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class NguoiDungController {
    private final NguoiDungService nguoiDungService;
    public NguoiDungController(NguoiDungService nguoiDungService) {
        this.nguoiDungService = nguoiDungService;
    }

    @PostMapping
    NguoiDungResponse createUser(@Valid @RequestBody NguoiDungCreationRequest request){
        return nguoiDungService.createUser(request);
    }

    @PutMapping("/{id}")
    NguoiDungResponse updateUser(@PathVariable("id") int id, @Valid @RequestBody NguoiDungUpdateRequest request){
        return nguoiDungService.updateUser(id,request);
    }

    @GetMapping
    Page<NguoiDungResponse> getAdminUsers(
            @RequestParam VaiTro role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String keyword) {
        return nguoiDungService.getUsersByRole(role, keyword, page - 1, size);
    }

    @GetMapping("/{id}")
    NguoiDungResponse getUser(@PathVariable("id") int id) {
        return nguoiDungService.getUser(id);
    }
}
