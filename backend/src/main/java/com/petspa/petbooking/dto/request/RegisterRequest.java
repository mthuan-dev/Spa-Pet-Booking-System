package com.petspa.petbooking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterRequest {
    @Email
    @NotBlank
    String email;
    @NotBlank
    @Size(min = 8)
    String password;
    @NotBlank
    String fullname;

    String phone;
}

