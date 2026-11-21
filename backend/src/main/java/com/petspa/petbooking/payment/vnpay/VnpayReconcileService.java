package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.entity.NguoiDung;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class VnpayReconcileService {

    private final VnpayReconcileStore store;
    private final VnpayQueryService queryService;
    private final String serverIp;

    public VnpayReconcileService(
            VnpayReconcileStore store,
            VnpayQueryService queryService,
            @Value("${vnpay.server-ip:127.0.0.1}") String serverIp) {
        this.store = store;
        this.queryService = queryService;
        this.serverIp = serverIp;
    }

    public VnpayReconcileStore.ReconcileResult reconcile(
            NguoiDung customer,
            Integer bookingId) {

        var snapshot = store.prepare(customer, bookingId);

        var result = queryService.query(
                snapshot.transactionRef(),
                snapshot.transactionDate(),
                serverIp
        );

        return store.apply(snapshot, result);
    }
}