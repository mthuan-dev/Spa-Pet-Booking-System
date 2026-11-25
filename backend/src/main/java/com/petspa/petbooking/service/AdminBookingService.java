package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.response.*;
import com.petspa.petbooking.entity.*;
import com.petspa.petbooking.entity.enums.*;
import com.petspa.petbooking.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminBookingService {
    private final DatLichRepository bookings;
    private final DatLichService mapper;

    public AdminBookingService(DatLichRepository bookings, DatLichService mapper) {
        this.bookings = bookings;
        this.mapper = mapper;
    }

    public AdminPageResponse<BookingResponse> getBookings(LocalDate startDate, LocalDate endDate,
            PhuongThucThanhToan paymentMethod, TrangThaiDatLich status, String keyword, int page, int size) {
        if (page < 1 || size < 1 || size > 100 || (startDate != null && endDate != null && startDate.isAfter(endDate))) {
            throw invalid("Tham số truy vấn lịch hẹn không hợp lệ.");
        }
        return AdminPageResponse.from(bookings.searchAdminBookings(
                startDate == null ? null : startDate.atStartOfDay(),
                endDate == null ? null : endDate.plusDays(1).atStartOfDay(), status, paymentMethod,
                keyword == null ? "" : keyword.trim(), PageRequest.of(page - 1, size,
                        Sort.by(Sort.Direction.DESC, "ngayTao", "maDatLich"))).map(mapper::toBookingResponse));
    }

    public List<BookingResponse> getSchedules() {
        return bookings.findAll(Sort.by("ngayHen", "gioBatDau", "maDatLich"))
                .stream().map(mapper::toBookingResponse).toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponse updateStatus(Integer id, TrangThaiDatLich status) {
        if (status != TrangThaiDatLich.COMPLETED && status != TrangThaiDatLich.CANCELLED) {
            throw invalid("Trạng thái lịch hẹn không hợp lệ.");
        }
        DatLich booking = bookings.lockById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn."));
        if (booking.getTrangThaiDatLich() != TrangThaiDatLich.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ được đổi trạng thái lịch hẹn đã CONFIRMED.");
        }
        booking.setTrangThaiDatLich(status);
        bookings.flush();
        return mapper.toBookingResponse(booking);
    }

    private ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
