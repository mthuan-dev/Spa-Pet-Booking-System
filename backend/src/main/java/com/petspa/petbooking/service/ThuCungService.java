package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.request.ThuCungRequest;
import com.petspa.petbooking.dto.response.ThuCungListResponse;
import com.petspa.petbooking.dto.response.ThuCungResponse;
import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.ThuCung;
import com.petspa.petbooking.entity.enums.VaiTro;
import com.petspa.petbooking.mapper.NguoidungMapper;
import com.petspa.petbooking.repository.NguoiDungRepository;
import com.petspa.petbooking.repository.ThuCungRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ThuCungService {
    private final NguoiDungRepository nguoiDungRepository;
    private final ThuCungRepository thuCungRepository;
    private final NguoidungMapper nguoidungMapper;
    private final StorageService storageService;

    public ThuCungService(NguoiDungRepository nguoiDungRepository,
                          ThuCungRepository thuCungRepository,
                          NguoidungMapper nguoidungMapper,
                          StorageService storageService) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.thuCungRepository = thuCungRepository;
        this.nguoidungMapper = nguoidungMapper;
        this.storageService = storageService;
    }

    public ThuCungListResponse getPets(Integer customerId) {
        NguoiDung customer = getCustomer(customerId);
        var pets = thuCungRepository.findByNguoiDung_MaNguoiDung(customerId)
                .stream().map(this::toResponse).toList();
        return ThuCungListResponse.builder()
                .customer(nguoidungMapper.toUserResponse(customer))
                .pets(pets)
                .build();
    }

    public ThuCungResponse createPet(Integer customerId, ThuCungRequest request) {
        ThuCung pet = new ThuCung();
        pet.setNguoiDung(getCustomer(customerId));
        applyRequest(pet, request);
        return toResponse(thuCungRepository.save(pet));
    }

    public ThuCungResponse updatePet(Integer customerId, Integer petId, ThuCungRequest request) {
        ThuCung pet = thuCungRepository
                .findByMaThuCungAndNguoiDung_MaNguoiDung(petId, customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy thú cưng của khách hàng này."));
        String oldImage = pet.getHinhAnh();
        applyRequest(pet, request);
        ThuCung savedPet = thuCungRepository.save(pet);
        deleteOldUpload(oldImage, savedPet.getHinhAnh()); // Xoá ảnh cũ
        return toResponse(savedPet);
    }

    public ThuCungResponse disablePet(Integer customerId, Integer petId) {
        ThuCung pet = thuCungRepository
                .findByMaThuCungAndNguoiDung_MaNguoiDung(petId, customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy thú cưng của khách hàng này."));
        pet.setTrangThai(0);
        return toResponse(thuCungRepository.save(pet));
    }

    private NguoiDung getCustomer(Integer customerId) {
        NguoiDung customer = nguoiDungRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng."));
        if (customer.getVaiTro() != VaiTro.CUSTOMER) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng.");
        }
        return customer;
    }

    private void applyRequest(ThuCung pet, ThuCungRequest request) {
        Integer status = request.getTrangThai() == null ? 1 : request.getTrangThai();
        if (status != 0 && status != 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Trạng thái thú cưng không hợp lệ.");
        }
        String name = request.getTenThuCung().trim();
        pet.setTenThuCung(name);
        pet.setLoaiThuCung(request.getLoaiThuCung());
        pet.setGiong(request.getGiong() == null || request.getGiong().trim().isEmpty()
                ? null : request.getGiong().trim());
        pet.setCanNang(request.getCanNang());
        pet.setHinhAnh(request.getHinhAnh() == null || request.getHinhAnh().trim().isEmpty()
                ? null : request.getHinhAnh().trim());
        pet.setTrangThai(status);
    }

    private ThuCungResponse toResponse(ThuCung pet) {
        return ThuCungResponse.builder()
                .maThuCung(pet.getMaThuCung())
                .maNguoiDung(pet.getNguoiDung().getMaNguoiDung())
                .tenThuCung(pet.getTenThuCung())
                .loaiThuCung(pet.getLoaiThuCung())
                .giong(pet.getGiong())
                .canNang(pet.getCanNang())
                .hinhAnh(pet.getHinhAnh())
                .trangThai(pet.getTrangThai())
                .ngayTao(pet.getNgayTao())
                .ngayCapNhat(pet.getNgayCapNhat())
                .build();
    } // Entity -> DTO

    private void deleteOldUpload(String oldImage, String newImage) {
        if (oldImage == null || oldImage.equals(newImage)) return;
        storageService.deleteImage(oldImage, "pets");
    }
}
