package com.petspa.petbooking.dto.response;

import com.petspa.petbooking.entity.enums.LoaiDichVu;
import java.time.LocalDateTime;

public record DichVuResponse(
        Integer madichvu, String ten, LoaiDichVu loaidichvu,
        Integer thoiluongphut, String hinhanh, String mota, Integer trangthai,
        LocalDateTime ngaytao, LocalDateTime ngaycapnhat
) {}
