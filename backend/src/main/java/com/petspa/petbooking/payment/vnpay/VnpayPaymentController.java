package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.service.CurrentCustomer;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/booking-data/bookings")
public class VnpayPaymentController {

    private final VnpayPaymentCoordinator paymentService;
    private final CurrentCustomer currentCustomer;

    public VnpayPaymentController(
            VnpayPaymentCoordinator paymentService, CurrentCustomer currentCustomer) {
        this.paymentService = paymentService;
        this.currentCustomer = currentCustomer;
    }

    public record PaymentUrlResponse(String paymentUrl) {}

    @PostMapping("/{bookingId}/vnpay")
    public PaymentUrlResponse createPaymentUrl(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer bookingId,
            HttpServletRequest request) {

        var customer = currentCustomer.require(jwt);

        String clientIp = request.getRemoteAddr();

        if ("0:0:0:0:0:0:0:1".equals(clientIp) || "::1".equals(clientIp)) {
            clientIp = "127.0.0.1";
        }

        String paymentUrl = paymentService.open(customer, bookingId, clientIp);

        return new PaymentUrlResponse(paymentUrl);
    }
}
