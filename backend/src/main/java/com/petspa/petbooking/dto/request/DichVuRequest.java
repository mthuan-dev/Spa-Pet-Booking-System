package com.petspa.petbooking.dto.request;

import com.petspa.petbooking.entity.enums.LoaiDichVu;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

// Nested record
public record DichVuRequest(
        @Size(min = 1, max = 150) String ten,
        LoaiDichVu loaidichvu,
        @Positive Integer thoiluongphut,
        @Size(max = 255) String hinhanh,
        @Size(max = 16000) String mota,
        @Min(0) @Max(1) Integer trangthai,
        List<@NotNull @Valid ThanhPhan> chitietcombo) {
    public record ThanhPhan(@NotNull @Positive Integer madichvucon) { } // DichVuRequest.ThanhPhan
}
