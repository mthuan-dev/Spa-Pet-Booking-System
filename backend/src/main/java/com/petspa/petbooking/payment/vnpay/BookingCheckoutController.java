package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.dto.request.BookingCreateRequest;
import com.petspa.petbooking.dto.response.BookingResponse;
import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.service.BookingWorkflowService;
import com.petspa.petbooking.service.CurrentCustomer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking-data")
public class BookingCheckoutController {
    private final Checkout checkout;
    private final CurrentCustomer currentCustomer;

    public BookingCheckoutController(Checkout checkout, CurrentCustomer currentCustomer) {
        this.checkout = checkout;
        this.currentCustomer = currentCustomer;
    }

    public record CheckoutResponse(BookingResponse booking, String paymentUrl) {}

    @PostMapping("/checkout")
    public CheckoutResponse create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody BookingCreateRequest request,
            HttpServletRequest servletRequest) {
        String ip = servletRequest.getRemoteAddr();
        if ("::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return checkout.create(currentCustomer.require(jwt), request, ip);
    }

    @Service
    public static class Checkout {
        private final BookingWorkflowService bookings;
        private final VnpayPaymentService payments;

        public Checkout(BookingWorkflowService bookings, VnpayPaymentService payments) {
            this.bookings = bookings;
            this.payments = payments;
        }

        // Booking, payment attempt and URL commit together. A URL creation error rolls back all
        // three.
        @Transactional(isolation = Isolation.READ_COMMITTED)
        public CheckoutResponse create(
                NguoiDung customer, BookingCreateRequest request, String ip) {
            BookingResponse booking = bookings.create(customer, request);
            String url =
                    "VNPAY".equals(request.paymentMethod())
                            ? payments.createPaymentUrl(customer, booking.id(), ip)
                            : null;
            return new CheckoutResponse(booking, url);
        }
    }
}
