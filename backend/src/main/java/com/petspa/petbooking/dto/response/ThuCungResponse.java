package com.petspa.petbooking.dto.response;

import com.petspa.petbooking.entity.enums.LoaiThuCung;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuCungResponse {
    private Integer maThuCung;
    private Integer maNguoiDung;
    private String tenThuCung;
    private LoaiThuCung loaiThuCung;
    private String giong;
    private BigDecimal canNang;
    private String hinhAnh;
    private Integer trangThai;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
}
