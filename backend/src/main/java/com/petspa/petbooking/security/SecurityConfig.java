package com.petspa.petbooking.security;

import java.util.List;
import com.petspa.petbooking.repository.NguoiDungRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private String[] PUBLIC_ENDPOINT = {
        "/api/auth/login","/api/auth/introspect","/api/auth/register"
    };
    @Value("${jwt.signerKey}")
    private String signerKey;
    /* public -> .permitAll()
     * private -> authenticated() */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtDecoder decoder) throws Exception {
        return http
                /* default Spring Security bật CRSF
                 -> chặn POST / PUT/ DELETE PATCH từ bên ngoài */
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET,
                                "/api/booking-data/services",
                                "/api/public/reviews",
                                "/api/booking-data/pet-images/**",
                                "/uploads/**", 
                                "/api/payments/vnpay/ipn").permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINT).permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/users/*").authenticated()
                        .requestMatchers("/graphql", "/api/users", "/api/users/**", "/api/pet-images", "/api/service-images",
                                "/api/services", "/api/services/**", "/api/service-prices", "/api/service-prices/**",
                                "/api/admin/**", "/api/reports/**")
                        .hasAuthority("SCOPE_ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> 
                    oauth2.jwt(jwt -> jwt.decoder(decoder))
                )
                // K dùng HTTPsession lưu đnhập. Mỗi request tự xác thực (JWT)
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
    @Bean
    JwtDecoder jwtDecoder(NguoiDungRepository users){

        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
               .macAlgorithm(MacAlgorithm.HS512)
               .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), token ->
                users.findByEmail(token.getSubject())
                        .filter(user -> Integer.valueOf(1).equals(user.getTrangThai())
                                && user.getVaiTro().name().equals(token.getClaimAsString("scope")))
                        .map(user -> OAuth2TokenValidatorResult.success())
                        .orElseGet(() -> OAuth2TokenValidatorResult.failure(
                                new OAuth2Error("invalid_token", "Tài khoản đã bị khoá", null)))));
        return decoder;
    };
    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(10);
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
