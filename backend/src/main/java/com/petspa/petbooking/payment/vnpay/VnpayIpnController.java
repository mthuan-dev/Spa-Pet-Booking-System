package com.petspa.petbooking.payment.vnpay;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
public class VnpayIpnController {

    private static final Logger log =
            LoggerFactory.getLogger(VnpayIpnController.class);

    private final VnpayIpnService ipnService;

    public VnpayIpnController(VnpayIpnService ipnService) {
        this.ipnService = ipnService;
    }

    @GetMapping("/ipn")
    public Map<String, String> receiveIpn(
            @RequestParam MultiValueMap<String, String> query) {

        Map<String, String> parameters = new HashMap<>();

        for (var entry : query.entrySet()) {
            String name = entry.getKey();

            if (!name.startsWith("vnp_")) {
                continue;
            }

            if (entry.getValue().size() != 1) {
                return Map.of(
                        "RspCode", "97",
                        "Message", "Duplicate parameters"
                );
            }

            parameters.put(name, entry.getValue().getFirst());
        }

        try {
            return ipnService.handle(parameters);
        } catch (Exception exception) {
            log.error(
                    "Không xử lý được IPN VNPay.",
                    exception
            );

            return Map.of(
                    "RspCode", "99",
                    "Message", "Internal error"
            );
        }
    }
}