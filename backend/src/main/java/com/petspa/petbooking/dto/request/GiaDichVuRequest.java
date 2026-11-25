package com.petspa.petbooking.dto.request;

import com.petspa.petbooking.entity.enums.LoaiThuCung;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record GiaDichVuRequest(
        @NotNull @Positive Integer madichvu,
        @NotNull LoaiThuCung loaithucung,
        @NotNull @DecimalMin("0") @DecimalMax("999.99") @Digits(integer = 3, fraction = 2) BigDecimal cannangtu,
        @NotNull @DecimalMin("0") @DecimalMax("999.99") @Digits(integer = 3, fraction = 2) BigDecimal cannangden,
        @NotNull @DecimalMin("0") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal gia) {}
