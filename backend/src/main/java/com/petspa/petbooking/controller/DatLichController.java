package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.response.BookingResponse;
import com.petspa.petbooking.service.DatLichService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class DatLichController {
    private final DatLichService datLichService;
    private final com.petspa.petbooking.service.CurrentCustomer currentCustomer;

    public DatLichController(DatLichService datLichService, com.petspa.petbooking.service.CurrentCustomer currentCustomer) {
        this.datLichService = datLichService;
        this.currentCustomer = currentCustomer;
    }

    @GetMapping
    public List<BookingResponse> getBookingsByUserId(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        return datLichService.getBookingsByUserId(currentCustomer.require(jwt).getMaNguoiDung());
    }
}
