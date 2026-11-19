package com.petspa.petbooking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class AuthenticationResponse {
    String token;
    boolean authentication;
    NguoiDungResponse user;
}
