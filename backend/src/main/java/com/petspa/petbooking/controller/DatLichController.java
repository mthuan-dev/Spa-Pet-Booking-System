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

    public DatLichController(DatLichService datLichService) {
        this.datLichService = datLichService;
    }

    @GetMapping
    public List<BookingResponse> getBookingsByUserId(@RequestParam Integer userId) {
        return datLichService.getBookingsByUserId(userId);
    }
}
