package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.entity.ThanhToan;
import com.petspa.petbooking.entity.enums.PhuongThucThanhToan;
import com.petspa.petbooking.entity.enums.TrangThaiGiaoDich;
import com.petspa.petbooking.repository.DatLichRepository;
import com.petspa.petbooking.repository.ThanhToanRepository;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Giải phóng khung giờ của booking VNPay quá hạn giữ chỗ (15 phút + 5 phút chờ).
 *
 * <p>Luôn đối soát trước khi hủy:
 *
 * <ul>
 *   <li>Chưa từng tạo URL, hoặc lần gần nhất đã FAILED (02): hủy.
 *   <li>QueryDr báo 91 (VNPay không có giao dịch): hủy.
 *   <li>QueryDr báo 00 (đã trả): ghi nhận PAID, không hủy.
 *   <li>QueryDr báo 02: ghi FAILED rồi hủy.
 *   <li>Trạng thái chưa rõ hoặc lỗi mạng/chữ ký: giữ nguyên, thử lại ở lượt sau.
 * </ul>
 *
 * <p>Gọi QueryDr ngoài transaction để không giữ khóa DB khi chờ mạng.
 */
@Component
public class VnpayHoldExpiryJob {
    private static final Logger log = LoggerFactory.getLogger(VnpayHoldExpiryJob.class);
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final DatLichRepository bookings;
    private final ThanhToanRepository payments;
    private final VnpayReconcileStore store;
    private final VnpayQueryService queryService;
    private final String serverIp;

    public VnpayHoldExpiryJob(
            DatLichRepository bookings,
            ThanhToanRepository payments,
            VnpayReconcileStore store,
            VnpayQueryService queryService,
            @Value("${vnpay.server-ip:127.0.0.1}") String serverIp) {
        this.bookings = bookings;
        this.payments = payments;
        this.store = store;
        this.queryService = queryService;
        this.serverIp = serverIp;
    }

    @Scheduled(initialDelay = 10_000, fixedDelayString = "${vnpay.hold-sweep-ms:10000}")
    public void releaseExpiredHolds() {
        LocalDateTime cutoff = LocalDateTime.now(ZONE).minus(DatLichRepository.HOLD_GRACE);
        for (Integer bookingId : bookings.findExpiredHoldIds(cutoff)) {
            try {
                release(bookingId, cutoff);
            } catch (Exception exception) {
                // Không đủ căn cứ thì không hủy; lượt sau sẽ thử lại.
                log.warn(
                        "Chua giai phong duoc booking {}: loaiLoi={}, lyDo={}; giu lich va thu lai sau",
                        bookingId, exception.getClass().getSimpleName(),
                        VnpayLogText.clean(exception.getMessage()));
            }
        }
    }

    private void release(Integer bookingId, LocalDateTime cutoff) {
        ThanhToan latest =
                payments.findAllByDatLich_MaDatLich(bookingId).stream()
                        .filter(
                                p ->
                                        p.getPhuongThuc() == PhuongThucThanhToan.VNPAY
                                                && p.getVnpTxnRef() != null)
                        .max(Comparator.comparing(ThanhToan::getMaThanhToan))
                        .orElse(null);
        if (latest == null
                || (latest.getTrangThai() == TrangThaiGiaoDich.FAILED
                        && "02".equals(latest.getVnpTransactionStatus()))) {
            cancel(bookingId, cutoff, latest == null ? "chua tao giao dich" : "lan thanh toan cuoi that bai");
            return;
        }
        if (latest.getTrangThai() == TrangThaiGiaoDich.SUCCESS) {
            return;
        }
        var snapshot = store.prepareForExpiry(bookingId);
        log.info("Bat dau doi soat booking het han: bookingId={}, txnRef={}, ngayTaoGiaoDich={}",
                bookingId, snapshot.transactionRef(), snapshot.transactionDate());
        var result =
                queryService.query(
                        snapshot.transactionRef(), snapshot.transactionDate(), serverIp, true);
        if (VnpayQueryService.isNoTransactionCode(result.get("vnp_ResponseCode"))) {
            cancel(bookingId, cutoff,
                    "VNPay khong ghi nhan giao dich (ma " + result.get("vnp_ResponseCode") + ")");
            return;
        }
        var applied = store.apply(snapshot, result);
        if (TrangThaiGiaoDich.FAILED.name().equals(applied.transactionStatus())) {
            cancel(bookingId, cutoff, "VNPay xac nhan thanh toan that bai");
        } else if (TrangThaiGiaoDich.SUCCESS.name().equals(applied.transactionStatus())) {
            log.info("Booking {} da duoc VNPay xac nhan thanh toan, giu lich.", bookingId);
        } else {
            log.info("Booking {} chua co ket qua VNPay cuoi cung, giu lich va thu lai sau.", bookingId);
        }
    }

    private void cancel(Integer bookingId, LocalDateTime cutoff, String reason) {
        if (store.cancelExpired(bookingId, cutoff)) {
            log.info("Da huy booking {} do het han thanh toan ({}).", bookingId, reason);
        }
    }
}
