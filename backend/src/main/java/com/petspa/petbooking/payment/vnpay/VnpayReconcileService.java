package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.entity.NguoiDung;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VnpayReconcileService {

    private final VnpayReconcileStore store;
    private final VnpayQueryService queryService;
    private final String serverIp;
    private final ConcurrentHashMap<String, Instant> requests = new ConcurrentHashMap<>();

    public VnpayReconcileService(
            VnpayReconcileStore store,
            VnpayQueryService queryService,
            @Value("${vnpay.server-ip:127.0.0.1}") String serverIp) {
        this.store = store;
        this.queryService = queryService;
        this.serverIp = serverIp;
    }

    public VnpayReconcileStore.ReconcileResult reconcile(NguoiDung customer, Integer bookingId) {

        var snapshot = store.prepare(customer, bookingId);
        Instant now = Instant.now();
        requests.entrySet().removeIf(entry -> entry.getValue().isBefore(now.minusSeconds(60)));
        if (requests.putIfAbsent(snapshot.transactionRef(), now) != null) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Kết quả thanh toán đang được cập nhật. Vui lòng thử lại sau một phút.");
        }

        var result =
                queryService.query(snapshot.transactionRef(), snapshot.transactionDate(), serverIp);

        return store.apply(snapshot, result);
    }
}
