package com.petspa.petbooking.controller;

import com.petspa.petbooking.service.*;
import com.petspa.petbooking.dto.request.*;
import com.petspa.petbooking.dto.response.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import jakarta.validation.Valid;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/booking-data")
public class BookingWorkflowController {
    private final BookingWorkflowService workflow;
    private final CurrentCustomer current;
    private final ThuCungService pets;
    private final NguoiDungService users;
    private final DatLichService bookings;
    private final BookingHoldService holds;

    public BookingWorkflowController(
            BookingWorkflowService workflow,
            CurrentCustomer current,
            ThuCungService pets,
            NguoiDungService users,
            DatLichService bookings,
            BookingHoldService holds) {
        this.workflow = workflow;
        this.current = current;
        this.pets = pets;
        this.users = users;
        this.bookings = bookings;
        this.holds = holds;
    }

    @GetMapping("/customer")
    public NguoiDungResponse customer(@AuthenticationPrincipal Jwt jwt) {
        return users.getUser(current.require(jwt).getMaNguoiDung());
    }

    @GetMapping("/pets")
    public ThuCungListResponse pets(@AuthenticationPrincipal Jwt jwt) {
        return pets.getPets(current.require(jwt).getMaNguoiDung());
    }

    @PostMapping("/pets")
    public ThuCungResponse pet(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ThuCungRequest request) {
        return pets.createPet(current.require(jwt).getMaNguoiDung(), request);
    }

    @PutMapping("/pets/{id}")
    public ThuCungResponse updatePet(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer id,
            @Valid @RequestBody ThuCungRequest request) {
        return pets.updatePet(current.require(jwt).getMaNguoiDung(), id, request);
    }

    @DeleteMapping("/pets/{id}")
    public ThuCungResponse deletePet(@AuthenticationPrincipal Jwt jwt, @PathVariable Integer id) {
        return pets.disablePet(current.require(jwt).getMaNguoiDung(), id);
    }

    @GetMapping("/services")
    public Object services() {
        return workflow.catalog();
    }

    @GetMapping("/slots")
    public Object slots(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam LocalDate date,
            @RequestParam int totalDuration,
            @RequestParam(required = false) Integer excludeBookingId) {
        if (excludeBookingId != null) {
            booking(jwt, excludeBookingId);
        }
        return workflow.slots(current.require(jwt).getMaNguoiDung(), date, totalDuration, excludeBookingId);
    }

    @GetMapping("/staff")
    public Object staff(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam LocalDate date,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime,
            @RequestParam(required = false) Integer excludeBookingId) {
        if (excludeBookingId != null) {
            booking(jwt, excludeBookingId);
        }
        return workflow.availableStaff(
                current.require(jwt).getMaNguoiDung(),
                date,
                startTime,
                (int) java.time.Duration.between(startTime, endTime).toMinutes(),
                excludeBookingId);
    }

    public record HoldRequest(
            @jakarta.validation.constraints.NotNull LocalDate appointmentDate,
            @jakarta.validation.constraints.NotNull LocalTime startTime,
            @jakarta.validation.constraints.NotNull Integer employeeId,
            @jakarta.validation.constraints.NotEmpty
                    List<@jakarta.validation.constraints.NotNull Integer> serviceIds) {}

    public record ReleaseHoldRequest(
            @jakarta.validation.constraints.NotNull LocalDate appointmentDate,
            @jakarta.validation.constraints.NotBlank
                    @jakarta.validation.constraints.Size(max = 36) String token) {}

    @PostMapping("/holds")
    public BookingHoldService.Hold hold(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody HoldRequest request) {
        return workflow.hold(current.require(jwt), request.appointmentDate(), request.startTime(),
                request.employeeId(), request.serviceIds());
    }

    @DeleteMapping("/holds")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void releaseHold(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ReleaseHoldRequest request) {
        holds.release(current.require(jwt).getMaNguoiDung(), request.appointmentDate(), request.token());
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings(@AuthenticationPrincipal Jwt jwt) {
        return bookings.getBookingsByUserId(current.require(jwt).getMaNguoiDung());
    }

    @GetMapping("/bookings/{id}")
    public BookingResponse booking(@AuthenticationPrincipal Jwt jwt, @PathVariable Integer id) {
        return bookings(jwt).stream()
                .filter(b -> b.id().equals(id))
                .findFirst()
                .orElseThrow(
                        () ->
                                new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.NOT_FOUND));
    }

    @PostMapping("/bookings")
    public BookingResponse create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody BookingCreateRequest request) {
        return workflow.create(current.require(jwt), request);
    }

    public record Reschedule(
            @jakarta.validation.constraints.NotNull LocalDate date,
            @jakarta.validation.constraints.NotNull LocalTime startTime,
            @jakarta.validation.constraints.NotNull Integer employeeId) {}

    public record Cancel(@jakarta.validation.constraints.Size(max = 255) String reason) {}

    public record Review(
            @jakarta.validation.constraints.NotNull
                    @jakarta.validation.constraints.Min(1)
                    @jakarta.validation.constraints.Max(5)
                    Integer rating,
            @jakarta.validation.constraints.Size(max = 2000) String comment) {}

    @PostMapping("/bookings/{id}/review")
    public BookingResponse review(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer id,
            @Valid @RequestBody Review request) {
        return workflow.review(current.require(jwt), id, request.rating(), request.comment());
    }

    @PutMapping("/bookings/{id}/reschedule")
    public BookingResponse reschedule(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer id,
            @Valid @RequestBody Reschedule request) {
        return workflow.reschedule(
                current.require(jwt),
                id,
                request.date(),
                request.startTime(),
                request.employeeId());
    }

    @PostMapping("/bookings/{id}/cancel")
    public BookingResponse cancel(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer id,
            @Valid @RequestBody Cancel request) {
        return workflow.cancel(current.require(jwt), id, request.reason());
    }
}
