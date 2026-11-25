package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.response.ReportResponse;
import com.petspa.petbooking.service.ReportService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
        private final ReportService service;

        public ReportController(ReportService service) {
                this.service = service;
        }

        @GetMapping("/bookings")
        public List<ReportResponse.Daily> bookings(@RequestParam(required = false) LocalDate startDate,
                        @RequestParam(required = false) LocalDate endDate) {
                return service.bookings(startDate, endDate);
        }

        @GetMapping("/services")
        public List<ReportResponse.Service> services(@RequestParam(required = false) LocalDate startDate,
                        @RequestParam(required = false) LocalDate endDate) {
                return service.services(startDate, endDate);
        }

        @GetMapping("/customers")
        public ReportResponse.Customers customers(@RequestParam(required = false) LocalDate startDate,
                        @RequestParam(required = false) LocalDate endDate) {
                return service.customers(startDate, endDate);
        }
}
