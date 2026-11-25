package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.response.BookingResponse;
import com.petspa.petbooking.entity.ChiTietDatLich;
import com.petspa.petbooking.entity.DatLich;
import com.petspa.petbooking.entity.ThanhToan;
import com.petspa.petbooking.repository.ChiTietDatLichRepository;
import com.petspa.petbooking.repository.DatLichRepository;
import com.petspa.petbooking.repository.ThanhToanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Comparator;

@Service
public class DatLichService {
    private final DatLichRepository datLichRepository;
    private final ChiTietDatLichRepository chiTietDatLichRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final com.petspa.petbooking.repository.DanhGiaRepository reviews;

    public DatLichService(
            DatLichRepository datLichRepository,
            ChiTietDatLichRepository chiTietDatLichRepository,
            ThanhToanRepository thanhToanRepository,
            com.petspa.petbooking.repository.DanhGiaRepository reviews) {
        this.datLichRepository = datLichRepository;
        this.chiTietDatLichRepository = chiTietDatLichRepository;
        this.thanhToanRepository = thanhToanRepository;
        this.reviews = reviews;
    }

    // Đầu vào userId đang lấy từ Postman; khi có đăng nhập sẽ lấy từ JWT.
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(Integer userId) {
        return datLichRepository.findAllByNguoiDung_MaNguoiDungOrderByNgayHenDesc(userId).stream()
                .map(this::toBookingResponse)
                .toList();
    }

    // Chuyển entity database thành DTO mà API được phép trả về.
    public BookingResponse toBookingResponse(DatLich booking) {
        var pet = booking.getThuCung();
        var employee = booking.getNhanVien();
        var owner = booking.getNguoiDung();

        List<BookingResponse.ServiceItem> services =
                chiTietDatLichRepository.findAllByDatLich_MaDatLich(booking.getMaDatLich()).stream()
                        .map(this::toServiceItem)
                        .toList();

        List<BookingResponse.Payment> payments =
                thanhToanRepository.findAllByDatLich_MaDatLich(booking.getMaDatLich()).stream()
                        .sorted(Comparator.comparing(ThanhToan::getMaThanhToan))
                        .map(this::toPayment)
                        .toList();

        return new BookingResponse(
                booking.getMaDatLich(),
                booking.getCodeDatLich(),
                owner.getMaNguoiDung(),
                new BookingResponse.Contact(
                        booking.getTenLienHe(), booking.getSdtLienHe(), booking.getEmailLienHe()),
                new BookingResponse.Pet(
                        pet.getMaThuCung(),
                        booking.getTenThuCung(),
                        booking.getLoaiThuCung().name(),
                        booking.getLoaiThuCung().name(),
                        pet.getGiong(),
                        booking.getCanNangThuCung(),
                        pet.getHinhAnh()),
                new BookingResponse.Employee(employee.getMaNguoiDung(), employee.getHoTen(), null),
                new BookingResponse.Appointment(
                        booking.getNgayHen(), booking.getGioBatDau(), booking.getGioKetThuc()),
                services,
                booking.getGhiChu(),
                booking.getTongTien(),
                booking.getTrangThaiDatLich().name(),
                booking.getTrangThaiThanhToan().name(),
                payments,
                reviews.findByDatLich_MaDatLich(booking.getMaDatLich())
                        .map(
                                r ->
                                        new BookingResponse.Review(
                                                r.getMaDanhGia(),
                                                r.getSoSao(),
                                                r.getBinhLuan(),
                                                Integer.valueOf(1).equals(r.getIsHidden()),
                                                r.getNgayTao()))
                        .orElse(null),
                booking.getLyDoHuy(),
                booking.getNgayTao(),
                booking.getNgayCapNhat(),
                booking.getHanThanhToan(),
                booking.getTrangThaiDatLich()
                                == com.petspa.petbooking.entity.enums.TrangThaiDatLich.CANCELLED
                        && booking.getTrangThaiThanhToan()
                                == com.petspa.petbooking.entity.enums.TrangThaiThanhToan.UNPAID
                        && DatLich.LY_DO_HET_HAN_THANH_TOAN.equals(booking.getLyDoHuy()));
    }

    private BookingResponse.ServiceItem toServiceItem(ChiTietDatLich detail) {
        return new BookingResponse.ServiceItem(
                detail.getId(),
                detail.getDichVu().getMaDichVu(),
                detail.getTenDichVu(),
                detail.getGia(),
                detail.getThoiLuongPhut());
    }

    private BookingResponse.Payment toPayment(ThanhToan payment) {
        return new BookingResponse.Payment(
                payment.getMaThanhToan(),
                payment.getPhuongThuc().name(),
                payment.getSoTien(),
                payment.getTrangThai().name(),
                payment.getThoiGianThanhToan());
    }
}
