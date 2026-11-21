package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.service.CurrentCustomer;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/booking-data/bookings")
public class VnpayReconcileController {

    private final VnpayReconcileService reconcileService;
    private final CurrentCustomer currentCustomer;

    public VnpayReconcileController(
            VnpayReconcileService reconcileService, CurrentCustomer currentCustomer) {
        this.reconcileService = reconcileService;
        this.currentCustomer = currentCustomer;
    }

    @PostMapping("/{bookingId}/vnpay/reconcile")
    public VnpayReconcileStore.ReconcileResult reconcile(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Integer bookingId) {

        var customer = currentCustomer.require(jwt);

        return reconcileService.reconcile(customer, bookingId);
    }
}
