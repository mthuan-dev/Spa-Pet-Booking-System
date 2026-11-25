package com.petspa.petbooking.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class ReportResponse {
    private ReportResponse() {}
    public record Daily(LocalDate date, long totalBookings, BigDecimal revenue) {}
    public record Service(Integer serviceId, String serviceName, long totalBookings, BigDecimal revenue) {}
    public record Customers(long guestCustomers, long memberCustomers) {}
}
