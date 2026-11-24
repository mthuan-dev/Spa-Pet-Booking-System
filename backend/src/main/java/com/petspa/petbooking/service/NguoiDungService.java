package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.request.NguoiDungCreationRequest;
import com.petspa.petbooking.dto.request.NguoiDungUpdateRequest;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.mapper.NguoidungMapper;
import com.petspa.petbooking.repository.NguoiDungRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.petspa.petbooking.entity.enums.VaiTro;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class NguoiDungService {
     NguoiDungRepository nguoiDungRepository;
     NguoidungMapper nguoidungMapper;

    public NguoiDungResponse createUser(NguoiDungCreationRequest request) {
        validateCreateRequest(request);
        if (nguoiDungRepository.findByEmail(request.getEmail().trim().toLowerCase()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email này đã được sử dụng.");
        }
        if (request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank()
                && nguoiDungRepository.existsBySoDienThoai(request.getSoDienThoai().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại này đã được sử dụng.");
        }
        NguoiDung user = nguoidungMapper.toUser(request);
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setHoTen(request.getHoTen().trim());
        user.setSoDienThoai(normalizePhone(request.getSoDienThoai()));
        user.setTrangThai(request.getTrangThai() == null ? 1 : request.getTrangThai());
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        return nguoidungMapper.toUserResponse(nguoiDungRepository.save(user));
    }

    public NguoiDungResponse updateUser(int id, NguoiDungUpdateRequest request) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng."));
        validateUpdateRequest(request);
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        if (email != null && nguoiDungRepository.findByEmail(email)
                .filter(existing -> !existing.getMaNguoiDung().equals(id)).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email này đã được sử dụng.");
        }
        if (request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank()
                && nguoiDungRepository.existsBySoDienThoaiAndMaNguoiDungNot(request.getSoDienThoai().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại này đã được sử dụng.");
        }
        nguoidungMapper.updateUser(user, request);
        if (email != null) user.setEmail(email);
        if (request.getHoTen() != null) user.setHoTen(request.getHoTen().trim());
        if (request.isSoDienThoaiProvided()) user.setSoDienThoai(normalizePhone(request.getSoDienThoai()));
        if (request.getTrangThai() != null) user.setTrangThai(request.getTrangThai());
        if (request.getMatKhau() != null && !request.getMatKhau().isBlank()) {
            user.setMatKhau(new BCryptPasswordEncoder(10).encode(request.getMatKhau()));
        }
        try {
            return nguoidungMapper.toUserResponse(nguoiDungRepository.save(user));
        } catch (DataIntegrityViolationException exception) {
            if (email != null && nguoiDungRepository.findByEmail(email)
                    .filter(existing -> !existing.getMaNguoiDung().equals(id)).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email này đã được sử dụng.", exception);
            }
            throw exception;
        }
    }

    public NguoiDungResponse getUser(int id) {
        return nguoidungMapper.toUserResponse(nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng.")));
    }

    public List<NguoiDung> getallUser() {
        return nguoiDungRepository.findAll();
    }

    public Page<NguoiDungResponse> getUsersByRole(VaiTro role, String keyword, int page, int size) {
        if (role == null || page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tham số truy vấn người dùng không hợp lệ.");
        }
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "maNguoiDung"));
        Page<NguoiDung> users = nguoiDungRepository.searchByRoleAndKeyword(role, normalizeKeyword(keyword), pageable);
        return users.map(nguoidungMapper::toUserResponse);
    }

    private void validateCreateRequest(NguoiDungCreationRequest request) {
        if (request == null || request.getEmail() == null || request.getHoTen() == null
                || request.getMatKhau() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu thông tin bắt buộc.");
        }
        if (request.getHoTen().trim().isEmpty() || request.getHoTen().length() > 100
                || request.getEmail().length() > 100
                || !request.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin người dùng không hợp lệ.");
        }
        if (request.getMatKhau().length() < 6 || request.getMatKhau().length() > 16) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cần từ 6 đến 16 ký tự.");
        }
        if (request.getVaiTro() == null
                || !(request.getVaiTro() == VaiTro.ADMIN || request.getVaiTro() == VaiTro.CUSTOMER)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò người dùng không hợp lệ.");
        }
        validateStatus(request.getTrangThai());
        validatePhone(request.getSoDienThoai());
    }

    private void validateUpdateRequest(NguoiDungUpdateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu cập nhật.");
        }
        if (request.getHoTen() != null && (request.getHoTen().trim().isEmpty() || request.getHoTen().length() > 100)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên cần từ 1 đến 100 ký tự.");
        }
        if (request.getEmail() != null) {
            if (request.getEmail().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không được để trống.");
            }
            if (request.getEmail().length() > 100) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email tối đa 100 ký tự.");
            }
        }
        validateStatus(request.getTrangThai());
        validatePhone(request.getSoDienThoai());
        if (request.getMatKhau() != null && !request.getMatKhau().isBlank()
                && (request.getMatKhau().length() < 6 || request.getMatKhau().length() > 16)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cần từ 6 đến 16 ký tự.");
        }
    }

    private void validateStatus(Integer status) {
        if (status != null && status != 0 && status != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái người dùng không hợp lệ.");
        }
    }

    private void validatePhone(String phone) {
        if (phone != null && !phone.isBlank() && (phone.length() > 15 || !phone.matches("^\\+?\\d{9,15}$"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại không hợp lệ.");
        }
    }

    private String normalizePhone(String phone) {
        return phone == null || phone.isBlank() ? null : phone.trim();
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null || keyword.isBlank() ? null : keyword.trim();
    }
}

