package com.petspa.petbooking.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record BookingCreateRequest(
    @NotNull Integer petId, @NotNull Integer employeeId,
    @NotNull LocalDate appointmentDate, @NotNull LocalTime startTime,
    @NotEmpty List<@NotNull Integer> serviceIds,
    @Size(max=2000) String note, @NotNull String paymentMethod
) {}
