package com.petspa.petbooking.dto.request;

import com.petspa.petbooking.entity.enums.NhaCungCap;
import com.petspa.petbooking.entity.enums.VaiTro;
import lombok.*;
import lombok.experimental.FieldDefaults;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class NguoiDungUpdateRequest {

    @Email
    @Size(max = 100)
    String email;
    @Size(min = 6, max = 16)
    String matKhau;
    @Size(max = 100)
    String hoTen;
    @Size(max = 15)
    @Pattern(regexp = "^\\+?\\d{9,15}$", message = "Số điện thoại không hợp lệ.")
    String soDienThoai;
    @JsonIgnore
    @Setter(AccessLevel.NONE)
    boolean soDienThoaiProvided;

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
        this.soDienThoaiProvided = true;
    }
    String googleId;
    NhaCungCap nhaCungCap;
    VaiTro vaiTro;
    Integer trangThai;
    LocalDateTime ngayTao;
    LocalDateTime ngayCapNhat;
}
