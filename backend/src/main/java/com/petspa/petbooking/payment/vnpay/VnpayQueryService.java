package com.petspa.petbooking.payment.vnpay;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class VnpayQueryService {

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("uuuuMMddHHmmss")
                    .withResolverStyle(ResolverStyle.STRICT);

    private final VnpayProperties properties;
    private final VnpaySignature signature;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public VnpayQueryService(
            VnpayProperties properties,
            VnpaySignature signature,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.signature = signature;
        this.objectMapper = objectMapper;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public Map<String, String> query(
            String transactionRef,
            String transactionDate,
            String serverIp) {

        validateInput(transactionRef, transactionDate, serverIp);

        String requestId = UUID.randomUUID()
                .toString()
                .replace("-", "");

        String createDate = LocalDateTime.now(
                ZoneId.of("Asia/Ho_Chi_Minh")
        ).format(TIME_FORMAT);

        String orderInfo = "Kiem tra giao dich " + transactionRef;

        Map<String, String> requestData = new HashMap<>();
        requestData.put("vnp_RequestId", requestId);
        requestData.put("vnp_Version", "2.1.0");
        requestData.put("vnp_Command", "querydr");
        requestData.put("vnp_TmnCode", properties.getTmnCode());
        requestData.put("vnp_TxnRef", transactionRef);
        requestData.put("vnp_TransactionDate", transactionDate);
        requestData.put("vnp_CreateDate", createDate);
        requestData.put("vnp_IpAddr", serverIp);
        requestData.put("vnp_OrderInfo", orderInfo);

        String signingData = String.join(
                "|",
                requestId,
                "2.1.0",
                "querydr",
                properties.getTmnCode(),
                transactionRef,
                transactionDate,
                createDate,
                serverIp,
                orderInfo
        );

        requestData.put(
                "vnp_SecureHash",
                signature.signQueryData(signingData)
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.getQueryUrl()))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            objectMapper.writeValueAsString(
                                    requestData
                            )
                    ))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                throw gatewayError(
                        "VNPay chưa trả được kết quả đối soát."
                );
            }

            Map<String, String> result = objectMapper.readValue(
                    response.body(),
                    new TypeReference<Map<String, String>>() {}
            );

            if (result == null) {
                throw gatewayError(
                        "Phản hồi đối soát VNPay không hợp lệ."
                );
            }

            verifyResponse(result, transactionRef);

            return result;

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw gatewayError(
                    "Yêu cầu đối soát đã bị gián đoạn. "
                            + "Trạng thái thanh toán chưa thay đổi."
            );
        } catch (IOException exception) {
            throw gatewayError(
                    "Không đọc được kết quả đối soát VNPay. "
                            + "Trạng thái thanh toán chưa thay đổi."
            );
        }
    }

    private void verifyResponse(
            Map<String, String> result,
            String transactionRef) {

        String signingData = String.join(
                "|",
                value(result, "vnp_ResponseId"),
                value(result, "vnp_Command"),
                value(result, "vnp_ResponseCode"),
                value(result, "vnp_Message"),
                value(result, "vnp_TmnCode"),
                value(result, "vnp_TxnRef"),
                value(result, "vnp_Amount"),
                value(result, "vnp_BankCode"),
                value(result, "vnp_PayDate"),
                value(result, "vnp_TransactionNo"),
                value(result, "vnp_TransactionType"),
                value(result, "vnp_TransactionStatus"),
                value(result, "vnp_OrderInfo"),
                value(result, "vnp_PromotionCode"),
                value(result, "vnp_PromotionAmount")
        );

        if (!signature.verifyQueryData(
                signingData,
                result.get("vnp_SecureHash"))) {
            throw gatewayError(
                    "Chữ ký phản hồi đối soát không hợp lệ. "
                            + "Trạng thái thanh toán chưa thay đổi."
            );
        }

        if (!"querydr".equals(result.get("vnp_Command"))
                || !properties.getTmnCode()
                        .equals(result.get("vnp_TmnCode"))
                || !transactionRef.equals(
                        result.get("vnp_TxnRef"))) {
            throw gatewayError(
                    "Phản hồi không khớp giao dịch cần đối soát."
            );
        }

        String responseCode = result.get("vnp_ResponseCode");

        if (responseCode == null
                || !responseCode.matches("[0-9]{2}")) {
            throw gatewayError(
                    "Mã phản hồi đối soát không hợp lệ."
            );
        }
    }

    private String value(
            Map<String, String> data,
            String key) {
        String value = data.get(key);
        return value == null ? "" : value;
    }

    private void validateInput(
            String transactionRef,
            String transactionDate,
            String serverIp) {

        if (properties.getTmnCode() == null
                || properties.getTmnCode().isBlank()
                || properties.getHashSecret() == null
                || properties.getHashSecret().isBlank()
                || properties.getQueryUrl() == null
                || properties.getQueryUrl().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa cấu hình đầy đủ đối soát VNPay."
            );
        }

        if (transactionRef == null
                || !transactionRef.matches("[a-zA-Z0-9]{1,100}")
                || transactionDate == null
                || !transactionDate.matches("[0-9]{14}")
                || serverIp == null
                || serverIp.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thiếu hoặc sai thông tin đối soát."
            );
        }

        try {
            LocalDateTime.parse(transactionDate, TIME_FORMAT);
        } catch (java.time.format.DateTimeParseException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thời gian giao dịch gốc không hợp lệ."
            );
        }
    }

    private ResponseStatusException gatewayError(String message) {
        return new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                message
        );
    }
}