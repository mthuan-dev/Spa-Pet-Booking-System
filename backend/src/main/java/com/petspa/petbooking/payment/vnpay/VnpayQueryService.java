package com.petspa.petbooking.payment.vnpay;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
import java.security.KeyStore;
import java.security.GeneralSecurityException;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;

@Service
public class VnpayQueryService {

    private static final Logger log = LoggerFactory.getLogger(VnpayQueryService.class);

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("uuuuMMddHHmmss").withResolverStyle(ResolverStyle.STRICT);

    private final VnpayProperties properties;
    private final VnpaySignature signature;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public VnpayQueryService(
            VnpayProperties properties, VnpaySignature signature, ObjectMapper objectMapper) {
        this.properties = properties;
        this.signature = signature;
        this.objectMapper = objectMapper;

        var builder = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5));
        // On Windows, use the OS trust roots (also used by PowerShell). This keeps
        // certificate and hostname verification enabled without JVM-wide flags.
        if (System.getProperty("os.name", "")
                .toLowerCase(java.util.Locale.ROOT)
                .contains("windows")) {
            try {
                KeyStore roots = KeyStore.getInstance("Windows-ROOT");
                roots.load(null, null);
                var trust =
                        TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
                trust.init(roots);
                var ssl = SSLContext.getInstance("TLS");
                ssl.init(null, trust.getTrustManagers(), null);
                builder.sslContext(ssl);
            } catch (GeneralSecurityException | IOException exception) {
                throw new IllegalStateException(
                        "Không đọc được kho chứng chỉ Windows cho VNPay.", exception);
            }
        }
        this.httpClient = builder.build();
    }

    public Map<String, String> query(
            String transactionRef, String transactionDate, String serverIp) {
        return query(transactionRef, transactionDate, serverIp, false);
    }

    /**
     * @param allowNotFound trả về phản hồi khi VNPay báo mã 91 (không tìm thấy giao dịch, tức
     *     khách chưa từng thanh toán) thay vì ném lỗi; dùng cho job giải phóng giữ chỗ.
     */
    public Map<String, String> query(
            String transactionRef,
            String transactionDate,
            String serverIp,
            boolean allowNotFound) {

        validateInput(transactionRef, transactionDate, serverIp);

        String requestId = UUID.randomUUID().toString().replace("-", "");

        String createDate = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).format(TIME_FORMAT);

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

        String signingData =
                String.join(
                        "|",
                        requestId,
                        "2.1.0",
                        "querydr",
                        properties.getTmnCode(),
                        transactionRef,
                        transactionDate,
                        createDate,
                        serverIp,
                        orderInfo);

        requestData.put("vnp_SecureHash", signature.signQueryData(signingData));

        try {
            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(properties.getQueryUrl()))
                            .timeout(Duration.ofSeconds(10))
                            .header("Content-Type", "application/json")
                            .header("Accept", "application/json")
                            .POST(
                                    HttpRequest.BodyPublishers.ofString(
                                            objectMapper.writeValueAsString(requestData)))
                            .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn(
                        "Doi soat VNPay: txnRef={}, requestId={}, HTTP={}; khong cap nhat thanh toan",
                        transactionRef, requestId, response.statusCode());
                throw gatewayError("VNPay chưa trả được kết quả đối soát.");
            }

            Map<String, String> result =
                    objectMapper.readValue(
                            response.body(), new TypeReference<Map<String, String>>() {});

            if (result == null) {
                throw gatewayError("Phản hồi đối soát VNPay không hợp lệ.");
            }

            // Only selected diagnostic fields; never log the body, keys or signature.
            log.info(
                    "Phan hoi doi soat VNPay (chua xac minh): txnRef={}, requestId={}, HTTP={}, vnp_ResponseCode={}, vnp_Message={}, vnp_TransactionStatus={}",
                    transactionRef,
                    requestId,
                    response.statusCode(),
                    logValue(result.get("vnp_ResponseCode")),
                    logValue(result.get("vnp_Message")),
                    logValue(result.get("vnp_TransactionStatus")));

            // Sandbox can return an unsigned error object. Never interpret this as a
            // payment result, or report a missing signature as the original cause.
            if (allowNotFound
                    && isNoTransactionCode(result.get("vnp_ResponseCode"))
                    && (result.get("vnp_TxnRef") == null
                            || transactionRef.equals(result.get("vnp_TxnRef")))) {
                return result;
            }
            if (!"00".equals(result.get("vnp_ResponseCode"))) {
                throw gatewayError(
                        "Chưa nhận được xác nhận từ VNPay. Nếu đã thanh toán, "
                                + "vui lòng chờ cập nhật hoặc liên hệ spa; không thanh toán thêm.");
            }

            verifyResponse(result, transactionRef);

            log.info("Doi soat VNPay: txnRef={}, requestId={}; da xac minh chu ky va ma giao dich",
                    transactionRef, requestId);

            return result;

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.warn("Doi soat VNPay bi gian doan: txnRef={}, requestId={}",
                    transactionRef, requestId);

            throw gatewayError(
                    "Yêu cầu đối soát đã bị gián đoạn. " + "Trạng thái thanh toán chưa thay đổi.");
        } catch (IOException exception) {
            Throwable cause = exception;
            while (cause.getCause() != null && cause.getCause() != cause) {
                cause = cause.getCause();
            }
            log.warn(
                    "Loi ket noi/doc phan hoi doi soat VNPay: txnRef={}, requestId={}, loaiLoi={}, nguyenNhan={}; khong cap nhat thanh toan",
                    transactionRef, requestId, exception.getClass().getSimpleName(),
                    cause.getClass().getSimpleName());
            throw gatewayError(
                    "Không đọc được kết quả đối soát VNPay. "
                            + "Trạng thái thanh toán chưa thay đổi.");
        } catch (ResponseStatusException exception) {
            log.warn("Doi soat VNPay chua duoc chap nhan: txnRef={}, requestId={}, lyDo={}",
                    transactionRef, requestId, logValue(exception.getReason()));
            throw exception;
        }
    }

    /**
     * 91 = VNPay không tìm thấy giao dịch. Sandbox VNPay trả 99 ("Unexpected error") cho
     * giao dịch mà khách chưa từng nhập thẻ/thanh toán (thoát tab). Chỉ dùng khi URL đã hết hạn.
     */
    public static boolean isNoTransactionCode(String code) {
        return "91".equals(code) || "99".equals(code);
    }

    private String logValue(String value) {
        if (value != null) {
            if (properties.getHashSecret() != null && !properties.getHashSecret().isBlank()) {
                value = value.replace(properties.getHashSecret(), "[key_an]");
            }
            if (properties.getTmnCode() != null && !properties.getTmnCode().isBlank()) {
                value = value.replace(properties.getTmnCode(), "[merchant_an]");
            }
        }
        return VnpayLogText.clean(value);
    }

    private void verifyResponse(Map<String, String> result, String transactionRef) {

        String signingData =
                String.join(
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
                        value(result, "vnp_PromotionAmount"));

        // Older terminals use the documented pre-promotion response shape.
        // Select by response schema; never skip verification on a successful query.
        if (!result.containsKey("vnp_PromotionCode")
                && !result.containsKey("vnp_PromotionAmount")) {
            signingData = signingData.substring(0, signingData.length() - 2);
        }

        if (!signature.verifyQueryData(signingData, result.get("vnp_SecureHash"))) {
            throw gatewayError(
                    "Chữ ký phản hồi đối soát không hợp lệ. "
                            + "Trạng thái thanh toán chưa thay đổi.");
        }

        if (!"querydr".equals(result.get("vnp_Command"))
                || !properties.getTmnCode().equals(result.get("vnp_TmnCode"))
                || !transactionRef.equals(result.get("vnp_TxnRef"))) {
            throw gatewayError("Phản hồi không khớp giao dịch cần đối soát.");
        }

        String responseCode = result.get("vnp_ResponseCode");

        if (responseCode == null || !responseCode.matches("[0-9]{2}")) {
            throw gatewayError("Mã phản hồi đối soát không hợp lệ.");
        }
    }

    private String value(Map<String, String> data, String key) {
        String value = data.get(key);
        return value == null ? "" : value;
    }

    private void validateInput(String transactionRef, String transactionDate, String serverIp) {

        if (properties.getTmnCode() == null
                || properties.getTmnCode().isBlank()
                || properties.getHashSecret() == null
                || properties.getHashSecret().isBlank()
                || properties.getQueryUrl() == null
                || properties.getQueryUrl().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình đầy đủ đối soát VNPay.");
        }

        if (transactionRef == null
                || !transactionRef.matches("[a-zA-Z0-9]{1,100}")
                || transactionDate == null
                || !transactionDate.matches("[0-9]{14}")
                || serverIp == null
                || serverIp.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Thiếu hoặc sai thông tin đối soát.");
        }

        try {
            LocalDateTime.parse(transactionDate, TIME_FORMAT);
        } catch (java.time.format.DateTimeParseException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Thời gian giao dịch gốc không hợp lệ.");
        }
    }

    private ResponseStatusException gatewayError(String message) {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
    }
}
