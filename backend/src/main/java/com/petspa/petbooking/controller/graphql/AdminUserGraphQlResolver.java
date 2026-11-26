package com.petspa.petbooking.controller.graphql;

import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.service.NguoiDungService;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AdminUserGraphQlResolver {
    private final NguoiDungService nguoiDungService;
    public AdminUserGraphQlResolver(NguoiDungService nguoiDungService) {
        this.nguoiDungService = nguoiDungService;
    }

    // FE: trang đầu 1, Spring: trang đầu 0
    @QueryMapping
    public Page<NguoiDungResponse> adminUsers(
            @Argument VaiTro role,
            @Argument int page,
            @Argument int size,
            @Argument String keyword) {
        return nguoiDungService.getUsersByRole(role, keyword, page - 1, size);
    }
}
