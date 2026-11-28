package com.petspa.petbooking.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingHoldService {
    private static final Logger LOG = LoggerFactory.getLogger(BookingHoldService.class);
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int TTL_SECONDS = 300;

    private final StringRedisTemplate redis;
    private final boolean enabled;
    private final DefaultRedisScript<Long> mutation = script(Long.class);
    private final DefaultRedisScript<List> lookup = script(List.class);

    public BookingHoldService(StringRedisTemplate redis,
            @Value("${booking.redis-holds-enabled:false}") boolean enabled) {
        this.redis = redis;
        this.enabled = enabled;
    }

    public record Hold(String token, long expiresInSeconds) {}

    public boolean enabled() {
        return enabled;
    }

    public Hold acquire(int customer, LocalDate date, LocalTime start, int duration, int employee) {
        String token = UUID.randomUUID().toString();
        Long remaining = execute(mutation, "acquire", customer, date, token, employee, start, duration);
        if (remaining == null || remaining == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Khung giờ vừa được giữ. Bạn chọn giờ hoặc nhân viên khác nhé.");
        }
        return new Hold(token, remaining);
    }

    public Set<Integer> busy(int customer, LocalDate date, LocalTime start, int duration) {
        if (!enabled) return Set.of();
        List<?> employees = execute(lookup, "busy", customer, date, "", 0, start, duration);
        return employees.stream().map(value -> Integer.valueOf(value.toString())).collect(Collectors.toSet());
    }

    public void verifyAndReleaseAfterCommit(int customer, LocalDate date, LocalTime start,
            int duration, int employee, String token) {
        if (!enabled) return;
        if (token == null || !Long.valueOf(1).equals(
                execute(mutation, "verify", customer, date, token, employee, start, duration))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lượt giữ chỗ đã hết hạn hoặc đã thay đổi. Bạn chọn lại lịch nhé.");
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    release(customer, date, token);
                } catch (ResponseStatusException exception) {
                    LOG.warn("Could not release committed booking hold; it will expire", exception);
                }
            }
        });
    }

    public void release(int customer, LocalDate date, String token) {
        if (enabled) execute(mutation, "release", customer, date, token, 0, LocalTime.MIDNIGHT, 0);
    }

    private <T> T execute(DefaultRedisScript<T> script, String action, int customer, LocalDate date,
            String token, int employee, LocalTime start, int duration) {
        try {
            return redis.execute(script, List.of("petspa:booking-holds:v1:" + date),
                    action, Integer.toString(customer), token, Integer.toString(employee),
                    Long.toString(start.toNanoOfDay()),
                    Long.toString(start.plusMinutes(duration).toNanoOfDay()),
                    Integer.toString(TTL_SECONDS),
                    Long.toString(date.atTime(start).atZone(ZONE).toEpochSecond()));
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa kết nối được dịch vụ giữ chỗ. Bạn thử lại sau nhé.", exception);
        }
    }

    private static <T> DefaultRedisScript<T> script(Class<T> result) {
        var script = new DefaultRedisScript<T>();
        script.setLocation(new ClassPathResource("booking-hold.lua"));
        script.setResultType(result);
        return script;
    }
}
