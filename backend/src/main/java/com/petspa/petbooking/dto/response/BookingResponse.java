package com.petspa.petbooking.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/** DTO công khai cho danh sách lịch đặt; không trả entity JPA trực tiếp ra API. */
public record BookingResponse(
        Integer id,
        String code,
        Integer userId,
        Contact contact,
        Pet pet,
        Employee employee,
        Appointment appointment,
        List<ServiceItem> services,
        String note,
        BigDecimal totalPrice,
        String bookingStatus,
        String paymentStatus,
        List<Payment> payments,
        Review review,
        String cancellationReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record Review(Integer id, Integer rating, String comment, boolean hidden, LocalDateTime createdAt) {}
    public record Contact(String name, String phone, String email) {}
    public record Pet(Integer id, String name, String type, String species,
                      String breed, BigDecimal weight, String imageUrl) {}
    public record Employee(Integer id, String name, String avatarUrl) {}
    public record Appointment(LocalDate date, LocalTime startTime, LocalTime endTime) {}
    public record ServiceItem(Integer id, Integer serviceId, String name,
                              BigDecimal price, Integer durationMinutes) {}
    public record Payment(Integer id, String method, BigDecimal amount,
                          String transactionStatus, LocalDateTime paidAt) {}
}
