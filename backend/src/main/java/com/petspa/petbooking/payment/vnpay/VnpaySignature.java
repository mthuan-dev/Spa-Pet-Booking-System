package com.petspa.petbooking.payment.vnpay;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Component
public class VnpaySignature {

    private final VnpayProperties properties;

    public VnpaySignature(VnpayProperties properties) {
        this.properties = properties;
    }

    public String buildSignedQuery(Map<String, String> parameters) {
        String query = buildQuery(parameters);
        String signature = sign(query);

        return query + "&vnp_SecureHash=" + signature;
    }

    public boolean verify(Map<String, String> parameters) {
        String receivedHash = parameters.get("vnp_SecureHash");

        if (receivedHash == null
                || !receivedHash.matches("[0-9a-fA-F]{128}")) {
            return false;
        }

        String expectedHash = sign(buildQuery(parameters));

        return MessageDigest.isEqual(
                HexFormat.of().parseHex(expectedHash),
                HexFormat.of().parseHex(receivedHash)
        );
    }

    private String buildQuery(Map<String, String> parameters) {
        Map<String, String> sorted = new TreeMap<>();

        parameters.forEach((name, value) -> {
            if (name.startsWith("vnp_")
                    && !name.equals("vnp_SecureHash")
                    && !name.equals("vnp_SecureHashType")
                    && value != null
                    && !value.isEmpty()) {
                sorted.put(name, value);
            }
        });

        return sorted.entrySet()
                .stream()
                .map(entry ->
                        encode(entry.getKey())
                                + "="
                                + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String sign(String data) {
        String secret = properties.getHashSecret();

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "Chưa cấu hình VNPAY_HASH_SECRET."
            );
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA512");

            SecretKeySpec secretKey = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"
            );

            mac.init(secretKey);

            byte[] signature = mac.doFinal(
                    data.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(signature);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                    "Không thể tạo chữ ký VNPay.",
                    exception
            );
        }
    }

    public String signQueryData(String data) {
        return sign(data);
    }

    public boolean verifyQueryData(
            String data,
            String receivedHash) {

        if (receivedHash == null
                || !receivedHash.matches("[0-9a-fA-F]{128}")) {
            return false;
        }

        String expectedHash = sign(data);

        return MessageDigest.isEqual(
                HexFormat.of().parseHex(expectedHash),
                HexFormat.of().parseHex(receivedHash)
        );
    }
}