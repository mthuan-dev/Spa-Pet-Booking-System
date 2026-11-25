package com.petspa.petbooking.dto.response;

import com.petspa.petbooking.entity.enums.LoaiThuCung;
import java.math.BigDecimal;

public record GiaDichVuResponse(
        Integer magiadichvu, Integer madichvu, LoaiThuCung loaithucung,
        BigDecimal cannangtu, BigDecimal cannangden, BigDecimal gia
) {}
