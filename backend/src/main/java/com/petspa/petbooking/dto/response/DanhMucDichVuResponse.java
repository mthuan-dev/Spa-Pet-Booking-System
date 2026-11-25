package com.petspa.petbooking.dto.response;

import java.util.List;

public record DanhMucDichVuResponse(List<DichVuResponse> dichvu,
        List<ThanhPhan> chitietcombo, List<GiaDichVuResponse> giadichvu) {
    public record ThanhPhan(Integer macombo, Integer madichvucon) {}
}
