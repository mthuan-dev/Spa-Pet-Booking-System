package com.petspa.petbooking.dto.request;

import com.petspa.petbooking.entity.enums.LoaiThuCung;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuCungRequest {
    @NotBlank
    @Size(max = 100)
    private String tenThuCung;
    @NotNull
    private LoaiThuCung loaiThuCung;
    @Size(max = 100)
    private String giong;
    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("999.99")
    private BigDecimal canNang;
    @Size(max = 255)
    private String hinhAnh;
    private Integer trangThai;
}
