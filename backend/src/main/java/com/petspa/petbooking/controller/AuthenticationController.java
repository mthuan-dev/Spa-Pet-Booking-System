package com.petspa.petbooking.controller;

import com.nimbusds.jose.JOSEException;
import com.petspa.petbooking.dto.request.AuthenticationRequest;
import com.petspa.petbooking.dto.request.IntrospectRequest;
import com.petspa.petbooking.dto.response.AuthenticationResponse;
import com.petspa.petbooking.dto.response.IntrospectResponse;
import com.petspa.petbooking.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;
    @PostMapping("/login")
    AuthenticationResponse authenticate(@RequestBody AuthenticationRequest request)
    {
       return authenticationService.Authenticated(request);
    }
    @PostMapping("/introspect")
    IntrospectResponse authenticate(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        return authenticationService.introspect(request);
    }
}
