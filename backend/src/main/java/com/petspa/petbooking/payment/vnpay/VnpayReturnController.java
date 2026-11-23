package com.petspa.petbooking.payment.vnpay;

import com.fasterxml.jackson.databind.JsonNode;
import com.petspa.petbooking.dto.response.BookingResponse;
import com.petspa.petbooking.service.CurrentCustomer;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;

@RestController
@RequestMapping("/api/booking-data/vnpay")
public class VnpayReturnController {
    private final VnpayIpnService notifications;
    private final CurrentCustomer customers;

    public VnpayReturnController(VnpayIpnService notifications, CurrentCustomer customers) {
        this.notifications = notifications;
        this.customers = customers;
    }

    @PostMapping("/return")
    public BookingResponse confirm(@AuthenticationPrincipal Jwt jwt, @RequestBody JsonNode body) {
        if (!body.isObject() || body.size() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        var parameters = new HashMap<String, String>();
        body.fields()
                .forEachRemaining(
                        entry -> {
                            if (!entry.getKey().startsWith("vnp_")
                                    || !entry.getValue().isTextual()
                                    || entry.getValue().asText().length() > 2048) {
                                throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST, "Dữ liệu VNPay không hợp lệ.");
                            }
                            parameters.put(entry.getKey(), entry.getValue().asText());
                        });
        return notifications.handleReturn(parameters, customers.require(jwt).getMaNguoiDung());
    }
}
