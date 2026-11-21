package com.petspa.petbooking.entity;

import com.petspa.petbooking.entity.enums.NhaCungCap;
import com.petspa.petbooking.entity.enums.VaiTro;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "nguoidung")
public class NguoiDung {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manguoidung")
     Integer maNguoiDung;
    @Column(name = "email", nullable = false, length = 100, unique = true)
     String email;
    @Column(name = "matkhau", length = 255)
     String matKhau;
    @Column(name = "hoten", nullable = false, length = 100)
     String hoTen;
    @Column(name = "sodienthoai", length = 15, unique = true)
     String soDienThoai;
    @Column(name = "googleid", length = 255, unique = true)
     String googleId;
    @Enumerated(EnumType.STRING) @Column(name = "nhacungcap", nullable = false, length = 6)
     NhaCungCap nhaCungCap = NhaCungCap.LOCAL;
    @Enumerated(EnumType.STRING) @Column(name = "vaitro", nullable = false, length = 8)
     VaiTro vaiTro = VaiTro.CUSTOMER;
    @Builder.Default
    @JdbcTypeCode(SqlTypes.TINYINT) @Column(name = "trangthai", nullable = false)
     Integer trangThai = 1;
    @CreationTimestamp
    @Column(name = "ngaytao", nullable = false, updatable = false)
     LocalDateTime ngayTao;
    @UpdateTimestamp
    @Column(name = "ngaycapnhat", nullable = false)
     LocalDateTime ngayCapNhat;


}
