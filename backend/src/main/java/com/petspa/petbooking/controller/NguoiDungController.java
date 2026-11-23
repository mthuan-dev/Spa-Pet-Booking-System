package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.NguoiDungCreationRequest;
import com.petspa.petbooking.dto.request.NguoiDungUpdateRequest;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.service.NguoiDungService;
import com.petspa.petbooking.service.CurrentCustomer;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class NguoiDungController {
    private final NguoiDungService nguoiDungService;
    private final CurrentCustomer currentCustomer;
    public NguoiDungController(NguoiDungService nguoiDungService, CurrentCustomer currentCustomer) {
        this.nguoiDungService = nguoiDungService;
        this.currentCustomer = currentCustomer;
    }

    @PostMapping
    NguoiDungResponse createUser(@Valid @RequestBody NguoiDungCreationRequest request){
        return nguoiDungService.createUser(request);
    }

    @PutMapping("/{id}")
    NguoiDungResponse updateUser(@PathVariable("id") int id, @Valid @RequestBody NguoiDungUpdateRequest request,
                                @AuthenticationPrincipal Jwt jwt){
        if (!"ADMIN".equals(jwt.getClaimAsString("scope"))) {
            if (currentCustomer.require(jwt).getMaNguoiDung() != id
                    || request.getEmail() != null || request.getMatKhau() != null
                    || request.getVaiTro() != null || request.getTrangThai() != null
                    || request.getNhaCungCap() != null || request.getGoogleId() != null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ được sửa họ tên và số điện thoại của chính mình.");
            }
        }
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
