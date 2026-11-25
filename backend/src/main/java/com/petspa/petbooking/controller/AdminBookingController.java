package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.BookingStatusRequest;
import com.petspa.petbooking.dto.response.*;
import com.petspa.petbooking.entity.enums.*;
import com.petspa.petbooking.service.AdminBookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminBookingController {
    private final AdminBookingService service;

    public AdminBookingController(AdminBookingService service) {
        this.service = service;
    }

    @GetMapping("/bookings")
    public AdminPageResponse<BookingResponse> getBookings(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) PhuongThucThanhToan paymentMethod,
            @RequestParam(required = false) TrangThaiDatLich status,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.getBookings(startDate, endDate, paymentMethod, status, keyword, page, size);
    }

    @GetMapping("/booking-schedules")
    public List<BookingResponse> getSchedules() {
        return service.getSchedules();
    }

    @PutMapping("/bookings/{id}/status")
    public BookingResponse updateStatus(@PathVariable Integer id, @Valid @RequestBody BookingStatusRequest request) {
        return service.updateStatus(id, request.status());
    }
}
