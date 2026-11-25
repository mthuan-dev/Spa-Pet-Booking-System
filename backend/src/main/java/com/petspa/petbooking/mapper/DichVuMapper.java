package com.petspa.petbooking.mapper;

import com.petspa.petbooking.dto.response.*;
import com.petspa.petbooking.entity.*;
import org.springframework.stereotype.Component;

@Component
public class DichVuMapper {
    public DichVuResponse toResponse(DichVu service) {
        return new DichVuResponse(service.getMaDichVu(), service.getTen(), service.getLoaiDichVu(),
                service.getThoiLuongPhut(), service.getHinhAnh(), service.getMoTa(), service.getTrangThai(),
                service.getNgayTao(), service.getNgayCapNhat());
    }

    public GiaDichVuResponse toResponse(GiaDichVu price) {
        return new GiaDichVuResponse(price.getMaGiaDichVu(), price.getDichVu().getMaDichVu(),
                price.getLoaiThuCung(), price.getCanNangTu(), price.getCanNangDen(), price.getGia());
    }

    public DanhMucDichVuResponse.ThanhPhan toResponse(ChiTietCombo detail) {
        return new DanhMucDichVuResponse.ThanhPhan(detail.getId().getMaCombo(), detail.getId().getMaDichVuCon());
    }
}
