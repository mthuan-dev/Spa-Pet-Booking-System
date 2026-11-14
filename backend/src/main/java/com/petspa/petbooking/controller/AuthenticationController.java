package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.AuthenticationRequest;
import com.petspa.petbooking.dto.response.AuthenticationResponse;
import com.petspa.petbooking.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;
    @PostMapping("/login")
    AuthenticationResponse authenticate(@RequestBody AuthenticationRequest request)
    {
        boolean result = authenticationService.Authenticated(request);
        return AuthenticationResponse.builder()
                        .authentication(result)
                        .build();

    }
}
