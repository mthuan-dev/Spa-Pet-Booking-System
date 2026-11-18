package com.petspa.petbooking.dto.response;

import com.petspa.petbooking.entity.enums.NhaCungCap;
import com.petspa.petbooking.entity.enums.VaiTro;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class NguoiDungResponse {
    Integer maNguoiDung;
    String email;
    String hoTen;
    String soDienThoai;
    String googleId;
    NhaCungCap nhaCungCap;
    VaiTro vaiTro;
    Integer trangThai;
    LocalDateTime ngayTao;
    LocalDateTime ngayCapNhat;

}
