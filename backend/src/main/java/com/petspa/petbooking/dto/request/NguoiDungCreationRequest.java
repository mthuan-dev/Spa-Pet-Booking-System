package com.petspa.petbooking.dto.request;

import com.petspa.petbooking.entity.enums.NhaCungCap;
import com.petspa.petbooking.entity.enums.VaiTro;
import lombok.*;
import lombok.experimental.FieldDefaults;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NguoiDungCreationRequest {
     @NotBlank @Email @Size(max = 100)
     String email;
     @NotBlank @Size(min = 6, max = 16)
     String matKhau;
     @NotBlank @Size(max = 100)
     String hoTen;
     @Size(max = 15)
     @Pattern(regexp = "^\\+?\\d{9,15}$", message = "Số điện thoại không hợp lệ.")
     String soDienThoai;
     String googleId;
     NhaCungCap nhaCungCap;
     @NotNull
     VaiTro vaiTro;
     Integer trangThai;
     LocalDateTime ngayTao;
     LocalDateTime ngayCapNhat;

}
