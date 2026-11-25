package com.petspa.petbooking.dto.response;

import org.springframework.data.domain.Page;
import java.util.List;

public record AdminPageResponse<T>(List<T> items, Meta meta) {
    public record Meta(int current_page, int per_page, long total_elements, int total_pages) {
    }

    public static <T> AdminPageResponse<T> from(Page<T> page) {
        return new AdminPageResponse<>(page.getContent(),
                new Meta(page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages()));
    }
}
