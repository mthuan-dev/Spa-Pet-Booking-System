package com.petspa.petbooking.controller;

import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.repository.NguoiDungRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class PasswordRecoveryController {
    private final NguoiDungRepository users;
    private final ObjectProvider<JavaMailSender> mail;
    private final Map<String, Instant> cooldowns = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    @Value("${spring.mail.username:}") private String sender;

    public PasswordRecoveryController(NguoiDungRepository users, ObjectProvider<JavaMailSender> mail) {
        this.users = users;
        this.mail = mail;
    }
    public record Request(@NotBlank @Email String email, @NotBlank @Pattern(regexp = "0[0-9]{9}") String phone) {}

    @PostMapping("/forgot-password")
    @CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
    @Transactional
    public synchronized Map<String, String> recover(@Valid @RequestBody Request request) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        Instant now = Instant.now();
        cooldowns.entrySet().removeIf(entry -> entry.getValue().isBefore(now.minusSeconds(60)));
        if (cooldowns.containsKey(email)) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);
        JavaMailSender transport = mail.getIfAvailable();
        if (transport == null || sender.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email is not configured");
        cooldowns.put(email, now);
        var user = users.findByEmail(email).orElse(null);
        if (user != null && user.getVaiTro() == VaiTro.CUSTOMER && Integer.valueOf(1).equals(user.getTrangThai())
                && request.phone().equals(user.getSoDienThoai()) && user.getMatKhau() != null) {
            byte[] bytes = new byte[18];
            random.nextBytes(bytes);
            String password = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(email);
            message.setSubject("MEOMEO — Mật khẩu mới của bạn");
            message.setText("Mật khẩu mới của bạn: " + password + "\n\nHãy đổi mật khẩu sau khi đăng nhập và không chia sẻ email này.");
            user.setMatKhau(new BCryptPasswordEncoder(10).encode(password));
            users.saveAndFlush(user);
            transport.send(message);
        }
        return Map.of("message", "Nếu thông tin khớp, mật khẩu mới sẽ được gửi qua email.");
    }
}
