package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.response.ReportResponse;
import com.petspa.petbooking.repository.ReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.*;
import java.time.*;
import java.time.temporal.*;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ReportService {
    private final ReportRepository repository;
    public ReportService(ReportRepository repository) { this.repository = repository; }

    public List<ReportResponse.Daily> bookings(LocalDate start, LocalDate end) {
        var range = range(start, end);
        Map<LocalDate, Long> counts = new HashMap<>();
        repository.countDaily(range.start(), range.end()).forEach(row -> counts.put(row.getDate(), row.getTotalBookings()));
        Map<LocalDate, BigDecimal> revenue = new HashMap<>();
        repository.revenueDaily(range.start().atStartOfDay(), range.end().plusDays(1).atStartOfDay())
                .forEach(row -> revenue.put(row.getDate(), row.getRevenue()));
        return range.start().datesUntil(range.end().plusDays(1)).map(day -> new ReportResponse.Daily(
                day, counts.getOrDefault(day, 0L), revenue.getOrDefault(day, BigDecimal.ZERO))).toList();
    }

    public List<ReportResponse.Service> services(LocalDate start, LocalDate end) {
        var range = range(start, end);
        return repository.services(range.start(), range.end(), range.start().atStartOfDay(), range.end().plusDays(1).atStartOfDay())
                .stream().map(row -> new ReportResponse.Service(row.getServiceId(), row.getServiceName(), row.getTotalBookings(),
                        row.getRevenue().setScale(2, RoundingMode.HALF_UP))).toList();
    }

    public ReportResponse.Customers customers(LocalDate start, LocalDate end) {
        var range = range(start, end);
        // Every booking has a registered customer foreign key; guest bookings are not supported by the schema.
        return new ReportResponse.Customers(0, repository.countCustomers(range.start(), range.end()));
    }

    private record Range(LocalDate start, LocalDate end) {}
    private Range range(LocalDate start, LocalDate end) {
        LocalDate week = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate from = start == null ? week : start;
        LocalDate to = end == null ? (start == null ? week.plusDays(6) : from.plusDays(6)) : end;
        if (to.isBefore(from) || ChronoUnit.DAYS.between(from, to) >= 366) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khoảng ngày báo cáo cần từ 1 đến 366 ngày.");
        }
        return new Range(from, to);
    }
}
