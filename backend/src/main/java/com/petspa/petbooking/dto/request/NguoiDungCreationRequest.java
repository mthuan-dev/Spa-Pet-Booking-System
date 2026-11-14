package com.petspa.petbooking.dto.request;

import com.petspa.petbooking.entity.enums.NhaCungCap;
import com.petspa.petbooking.entity.enums.VaiTro;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NguoiDungCreationRequest {
     String email;
     String matKhau;
     String hoTen;
     String soDienThoai;
     String googleId;
     NhaCungCap nhaCungCap;
     VaiTro vaiTro;
     Integer trangThai;
     LocalDateTime ngayTao;
     LocalDateTime ngayCapNhat;

}
