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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
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
                .stream()
                .map(this::toResponse) // entity -> dto response
                .toList();
        return ThuCungListResponse.builder()
                .customer(nguoidungMapper.toUserResponse(customer))
                .pets(pets)
                .build();
    }

    @Transactional
    public ThuCungResponse createPet(Integer customerId, ThuCungRequest request) {
        return createPet(customerId, request, null);
    }

    @Transactional
    public ThuCungResponse createPet(Integer customerId, ThuCungRequest request, MultipartFile file) {
        ThuCung pet = new ThuCung();
        pet.setNguoiDung(getCustomer(customerId));
        applyRequest(pet, request);
        storeNewImage(pet, file);
        return toResponse(thuCungRepository.save(pet));
    }

    @Transactional
    public ThuCungResponse updatePet(Integer customerId, Integer petId, ThuCungRequest request) {
        return updatePet(customerId, petId, request, null);
    }

    @Transactional
    public ThuCungResponse updatePet(Integer customerId, Integer petId, ThuCungRequest request, MultipartFile file) {
        ThuCung pet = thuCungRepository
                .lockByIdAndCustomerId(petId, customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy thú cưng của khách hàng này."));
        String oldImage = pet.getHinhAnh();
        applyRequest(pet, request);
        storeNewImage(pet, file);
        ThuCung savedPet = thuCungRepository.save(pet);
        deleteOldUploadAfterCommit(oldImage, savedPet.getHinhAnh());
        return toResponse(savedPet);
    }

    @Transactional
    public ThuCungResponse disablePet(Integer customerId, Integer petId) {
        ThuCung pet = thuCungRepository
                .lockByIdAndCustomerId(petId, customerId)
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

    private void storeNewImage(ThuCung pet, MultipartFile file) {
        if (file == null) return;
        String image = storageService.storeImage(file, "pets");
        try {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    if (status == STATUS_ROLLED_BACK) storageService.deleteImage(image, "pets");
                }
            });
        } catch (RuntimeException exception) {
            storageService.deleteImage(image, "pets");
            throw exception;
        }
        pet.setHinhAnh(image);
    }

    private void deleteOldUploadAfterCommit(String oldImage, String newImage) {
        if (oldImage == null || storageService.isSameImage(oldImage, newImage, "pets")) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                storageService.deleteImage(oldImage, "pets");
            }
        });
    }
}
