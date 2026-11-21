package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.entity.NguoiDung;
import org.springframework.stereotype.Service;

@Service
public class VnpayPaymentCoordinator {
    private final VnpayPaymentService payments;
    private final VnpayReconcileService reconciliation;

    public VnpayPaymentCoordinator(
            VnpayPaymentService payments, VnpayReconcileService reconciliation) {
        this.payments = payments;
        this.reconciliation = reconciliation;
    }

    // Deliberately outside a transaction: QueryDr must not hold database locks.
    public String open(NguoiDung customer, Integer bookingId, String ip) {
        try {
            return payments.createPaymentUrl(customer, bookingId, ip);
        } catch (VnpayPendingPaymentException exception) {
            reconciliation.reconcile(customer, bookingId);
            // Only an authoritative failure permits retry; a paid/unknown result stays blocked.
            return payments.createPaymentUrl(customer, bookingId, ip);
        }
    }
}
