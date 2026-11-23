package com.petspa.petbooking.payment.vnpay;

import java.text.Normalizer;

/** Keep diagnostic values on one ASCII line without logging full payloads. */
final class VnpayLogText {
    private VnpayLogText() {}

    static String clean(String value) {
        if (value == null || value.isBlank()) {
            return "khong_co";
        }
        String text = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('\u0111', 'd')
                .replace('\u0110', 'D')
                .replaceAll("https?://\\S+", "[url_an]")
                .replaceAll("(?i)[a-f0-9]{64,}", "[chu_ky_an]")
                .replaceAll("[^\\x20-\\x7E]", " ");
        return text.substring(0, Math.min(text.length(), 320));
    }
}
