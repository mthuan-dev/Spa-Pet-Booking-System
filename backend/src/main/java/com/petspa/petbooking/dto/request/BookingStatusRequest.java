package com.petspa.petbooking.dto.request;

import com.petspa.petbooking.entity.enums.TrangThaiDatLich;
import jakarta.validation.constraints.NotNull;

public record BookingStatusRequest(@NotNull TrangThaiDatLich status) {
}
