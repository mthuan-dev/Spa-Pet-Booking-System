package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.request.*;
import com.petspa.petbooking.dto.response.*;
import com.petspa.petbooking.entity.*;
import com.petspa.petbooking.entity.enums.LoaiDichVu;
import com.petspa.petbooking.mapper.DichVuMapper;
import com.petspa.petbooking.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DichVuService {
    private final DichVuRepository services;
    private final GiaDichVuRepository prices;
    private final ChiTietComboRepository comboDetails;
    private final DichVuMapper mapper;

    public DichVuService(DichVuRepository services, GiaDichVuRepository prices,
            ChiTietComboRepository comboDetails, DichVuMapper mapper) {
        this.services = services;
        this.prices = prices;
        this.comboDetails = comboDetails;
        this.mapper = mapper;
    }

    public DanhMucDichVuResponse getCatalog() {
        return new DanhMucDichVuResponse(
                services.findAll(Sort.by("maDichVu")).stream().map(mapper::toResponse).toList(),
                comboDetails.findAll(Sort.by("id.maCombo", "id.maDichVuCon")).stream().map(mapper::toResponse).toList(),
                prices.findAll(Sort.by("dichVu.maDichVu", "loaiThuCung", "canNangTu", "maGiaDichVu"))
                        .stream().map(mapper::toResponse).toList());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public DichVuResponse createService(DichVuRequest request) {
        if (request.ten() == null || request.thoiluongphut() == null) {
            throw invalid("Vui lòng nhập tên và thời lượng dịch vụ.");
        }
        DichVu service = new DichVu();
        apply(service, request);
        List<DichVu> children = validateChildren(service, request);
        services.saveAndFlush(service);
        replaceChildren(service, children);
        return mapper.toResponse(service);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public DichVuResponse updateService(Integer id, DichVuRequest request) {
        DichVu service = lockService(id);
        if (request.loaidichvu() != null && request.loaidichvu() != service.getLoaiDichVu()) {
            throw invalid("Không thể đổi loại dịch vụ.");
        }
        apply(service, request);
        if (request.chitietcombo() != null) {
            replaceChildren(service, validateChildren(service, request));
        }
        service.setNgayCapNhat(java.time.LocalDateTime.now());
        services.flush();
        return mapper.toResponse(service);
    }

    private void apply(DichVu service, DichVuRequest request) {
        if (request.ten() != null) {
            if (request.ten().isBlank())
                throw invalid("Tên dịch vụ không được để trống.");
            service.setTen(request.ten().trim());
        }
        if (request.loaidichvu() != null)
            service.setLoaiDichVu(request.loaidichvu());
        if (request.thoiluongphut() != null)
            service.setThoiLuongPhut(request.thoiluongphut());
        if (request.trangthai() != null)
            service.setTrangThai(request.trangthai());
        if (request.hinhanh() != null)
            service.setHinhAnh(nullableText(request.hinhanh()));
        if (request.mota() != null)
            service.setMoTa(nullableText(request.mota()));
    }

    private List<DichVu> validateChildren(DichVu service, DichVuRequest request) {
        List<DichVuRequest.ThanhPhan> requested = request.chitietcombo();
        if (service.getLoaiDichVu() == LoaiDichVu.SINGLE) {
            if (requested != null && !requested.isEmpty())
                throw invalid("Dịch vụ lẻ không có dịch vụ thành phần.");
            return List.of();
        }
        if (requested == null || requested.isEmpty())
            throw invalid("Vui lòng chọn dịch vụ thành phần cho combo.");
        Set<Integer> ids = new LinkedHashSet<>();
        for (var child : requested) {
            if (!ids.add(child.madichvucon()))
                throw invalid("Dịch vụ thành phần bị trùng.");
        }
        List<DichVu> children = services.findAllById(ids);
        if (children.size() != ids.size())
            throw missing("Không tìm thấy dịch vụ thành phần.");
        if (children.stream().anyMatch(child -> child.getLoaiDichVu() != LoaiDichVu.SINGLE
                || child.getMaDichVu().equals(service.getMaDichVu()))) {
            throw invalid("Dịch vụ thành phần phải là dịch vụ lẻ và không được là chính combo.");
        }
        return children;
    }

    private void replaceChildren(DichVu service, List<DichVu> children) {
        // Delete only removed children, retaining unchanged composite keys in the
        // persistence context.
        var previous = comboDetails.findById_MaCombo(service.getMaDichVu());
        Set<Integer> wanted = new HashSet<>();
        children.forEach(child -> wanted.add(child.getMaDichVu()));
        comboDetails
                .deleteAll(previous.stream().filter(row -> !wanted.contains(row.getId().getMaDichVuCon())).toList());
        Set<Integer> existing = new HashSet<>();
        previous.forEach(row -> existing.add(row.getId().getMaDichVuCon()));
        for (var child : children) {
            if (existing.contains(child.getMaDichVu()))
                continue;
            ChiTietCombo detail = new ChiTietCombo();
            detail.setId(new ChiTietComboId(service.getMaDichVu(), child.getMaDichVu()));
            detail.setCombo(service);
            detail.setDichVuCon(child);
            comboDetails.save(detail);
        }
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public GiaDichVuResponse createPrice(GiaDichVuRequest request) {
        DichVu service = lockService(request.madichvu());
        return savePrice(new GiaDichVu(), service, request);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public GiaDichVuResponse updatePrice(Integer id, GiaDichVuRequest request) {
        DichVu service = lockService(
                prices.findServiceId(id).orElseThrow(() -> missing("Không tìm thấy giá dịch vụ.")));
        GiaDichVu price = prices.findById(id).orElseThrow(() -> missing("Không tìm thấy giá dịch vụ."));
        if (!service.getMaDichVu().equals(request.madichvu()) || price.getLoaiThuCung() != request.loaithucung()) {
            throw invalid("Không thể đổi dịch vụ hoặc loại thú cưng của mức giá. Hãy tạo mức giá mới.");
        }
        return savePrice(price, service, request);
    }

    private GiaDichVuResponse savePrice(GiaDichVu price, DichVu service, GiaDichVuRequest request) {
        if (request.cannangden().compareTo(request.cannangtu()) <= 0) {
            throw invalid("Cân nặng đến phải lớn hơn cân nặng từ.");
        }
        // Every writer locks the service row, including when no price row exists yet.
        boolean overlap = prices.findByDichVu_MaDichVuAndLoaiThuCung(service.getMaDichVu(), request.loaithucung())
                .stream().anyMatch(other -> !Objects.equals(other.getMaGiaDichVu(), price.getMaGiaDichVu())
                        && request.cannangtu().compareTo(other.getCanNangDen()) < 0
                        && request.cannangden().compareTo(other.getCanNangTu()) > 0);
        if (overlap)
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Khoảng cân nặng bị trùng với mức giá khác của dịch vụ và loại thú cưng này.");
        price.setDichVu(service);
        price.setLoaiThuCung(request.loaithucung());
        price.setCanNangTu(request.cannangtu());
        price.setCanNangDen(request.cannangden());
        price.setGia(request.gia());
        return mapper.toResponse(prices.saveAndFlush(price));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deletePrice(Integer id) {
        lockService(prices.findServiceId(id).orElseThrow(() -> missing("Không tìm thấy giá dịch vụ.")));
        GiaDichVu price = prices.findById(id).orElseThrow(() -> missing("Không tìm thấy giá dịch vụ."));
        prices.delete(price);
    }

    private DichVu lockService(Integer id) {
        return services.lockById(id).orElseThrow(() -> missing("Không tìm thấy dịch vụ."));
    }

    private String nullableText(String value) {
        return value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException missing(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
