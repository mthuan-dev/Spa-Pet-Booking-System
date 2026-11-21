package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.request.BookingCreateRequest;
import com.petspa.petbooking.dto.response.BookingResponse;
import com.petspa.petbooking.entity.*;
import com.petspa.petbooking.entity.enums.*;
import com.petspa.petbooking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.*;
import java.math.BigDecimal;
import java.util.*;
import com.petspa.petbooking.mail.BookingCreatedEvent;
import org.springframework.context.ApplicationEventPublisher;
@Service
@Transactional(readOnly=true)
public class BookingWorkflowService {
    private final NguoiDungRepository users;
    private final ThuCungRepository pets;
    private final DichVuRepository services;
    private final GiaDichVuRepository prices;
    private final DatLichRepository bookings;
    private final ChiTietDatLichRepository details;
    private final ThanhToanRepository payments;
    private final DatLichService reader;
    private final DanhGiaRepository reviews;
    private final ApplicationEventPublisher eventPublisher;
    
    public BookingWorkflowService(NguoiDungRepository users, ThuCungRepository pets, DichVuRepository services,
            GiaDichVuRepository prices, DatLichRepository bookings, ChiTietDatLichRepository details,
            ThanhToanRepository payments, DatLichService reader, DanhGiaRepository reviews, ApplicationEventPublisher eventPublisher) {
        this.users=users; this.pets=pets; this.services=services; this.prices=prices;
        this.bookings=bookings; this.details=details; this.payments=payments; this.reader=reader;
        this.reviews=reviews;
        this.eventPublisher = eventPublisher;
    }
    private ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST,message); }
    public List<Map<String,Object>> catalog() {
        var allPrices=prices.findAll();
        return services.findAll().stream().filter(s -> Integer.valueOf(1).equals(s.getTrangThai())).map(s -> {
            Map<String,Object> row=new LinkedHashMap<>();
            row.put("madichvu",s.getMaDichVu()); row.put("ten",s.getTen()); row.put("loaidichvu",s.getLoaiDichVu());
            row.put("thoiluongphut",s.getThoiLuongPhut()); row.put("hinhanh",s.getHinhAnh()); row.put("mota",s.getMoTa());
            row.put("prices",allPrices.stream().filter(p -> p.getDichVu().getMaDichVu().equals(s.getMaDichVu())).map(p -> Map.of(
                "madichvu",s.getMaDichVu(),"loaithucung",p.getLoaiThuCung(),"cannangtu",p.getCanNangTu(),"cannangden",p.getCanNangDen(),"gia",p.getGia())).toList());
            return row;
        }).toList();
    }
    private boolean validWindow(LocalDate date, LocalTime start, int duration) {
        if(duration<=0 || duration>600) return false;
        return !LocalDateTime.of(date,start).isBefore(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))
            && !start.isBefore(LocalTime.of(8,0)) && start.plusMinutes(duration).isAfter(start)
            && !start.plusMinutes(duration).isAfter(LocalTime.of(18,0));
    }
    public List<Map<String,Object>> staff(LocalDate date, LocalTime start, int duration, Integer exclude) {
        if(!validWindow(date,start,duration)) return List.of();
        LocalTime end=start.plusMinutes(duration);
        var busy=bookings.findBusyEmployeeIds(date,start,end,exclude,
            List.of(TrangThaiDatLich.PENDING,TrangThaiDatLich.CONFIRMED));
        return users.findByVaiTro(VaiTro.ADMIN).stream().filter(u -> Integer.valueOf(1).equals(u.getTrangThai()) && !busy.contains(u.getMaNguoiDung()))
            .map(u -> Map.<String,Object>of("id",u.getMaNguoiDung(),"name",u.getHoTen(),"role","Nhân viên spa","specialties",List.of(),"avatarTone","honey")).toList();
    }
    public List<String> slots(LocalDate date,int duration, Integer exclude) {
        return List.of("08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00").stream()
            .filter(t -> !staff(date,LocalTime.parse(t),duration,exclude).isEmpty()).toList();
    }
    private DatLich owned(Integer id, NguoiDung customer) {
        var booking=bookings.lockById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if(!booking.getNguoiDung().getMaNguoiDung().equals(customer.getMaNguoiDung())) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return booking;
    }
    @Transactional
    public BookingResponse review(NguoiDung customer,Integer id,int rating,String comment) {
        var booking=owned(id,customer);
        if(booking.getTrangThaiDatLich()!=TrangThaiDatLich.COMPLETED || booking.getTrangThaiThanhToan()!=TrangThaiThanhToan.PAID || reviews.findByDatLich_MaDatLich(id).isPresent()) throw invalid("Lịch này không thể đánh giá.");
        var review=new DanhGia(); review.setDatLich(booking); review.setSoSao(rating); review.setBinhLuan(comment); reviews.saveAndFlush(review);
        return reader.getBookingsByUserId(customer.getMaNguoiDung()).stream().filter(b -> b.id().equals(id)).findFirst().orElseThrow();
    }
    @Transactional(isolation=Isolation.READ_COMMITTED)
    public BookingResponse reschedule(NguoiDung customer,Integer id,LocalDate date,LocalTime start,Integer employeeId) {
        var booking=owned(id,customer);
        if(booking.getTrangThaiDatLich()!=TrangThaiDatLich.PENDING) throw invalid("Chỉ lịch chờ xác nhận mới được đổi.");
        if(!LocalDateTime.of(booking.getNgayHen(),booking.getGioBatDau()).isAfter(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))) throw invalid("Lịch đã đến giờ hẹn.");
        int duration=details.findAllByDatLich_MaDatLich(id).stream().mapToInt(ChiTietDatLich::getThoiLuongPhut).sum();
        if(!validWindow(date,start,duration)) throw invalid("Ngày hoặc giờ hẹn không hợp lệ.");
        var employee=users.lockById(employeeId).orElseThrow(() -> invalid("Nhân viên không tồn tại."));
        if(staff(date,start,duration,id).stream().noneMatch(s -> s.get("id").equals(employeeId))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Nhân viên không còn trống ở khung giờ này.");
        booking.setNgayHen(date); booking.setGioBatDau(start); booking.setGioKetThuc(start.plusMinutes(duration)); booking.setNhanVien(employee);
        bookings.saveAndFlush(booking);
        return reader.getBookingsByUserId(customer.getMaNguoiDung()).stream().filter(b -> b.id().equals(id)).findFirst().orElseThrow();
    }
    @Transactional
    public BookingResponse cancel(NguoiDung customer,Integer id,String reason) {
        var booking=owned(id,customer);
        if(booking.getTrangThaiDatLich()!=TrangThaiDatLich.PENDING || booking.getTrangThaiThanhToan()!=TrangThaiThanhToan.UNPAID) throw invalid("Lịch này không thể hủy.");
        var bookingPayments=payments.findAllByDatLich_MaDatLich(id);
        // Fail closed for missing payment data or any online payment attempt.
        if(bookingPayments.isEmpty() || bookingPayments.stream().anyMatch(p -> p.getPhuongThuc()!=PhuongThucThanhToan.CASH
                || p.getTrangThai()==TrangThaiGiaoDich.SUCCESS))
            throw invalid("Chỉ lịch chưa thanh toán và chọn thanh toán tại spa mới được tự hủy. Vui lòng liên hệ spa để được hỗ trợ.");
        booking.setTrangThaiDatLich(TrangThaiDatLich.CANCELLED); booking.setLyDoHuy(reason);
        for(var payment:bookingPayments) if(payment.getTrangThai()==TrangThaiGiaoDich.PENDING) payment.setTrangThai(TrangThaiGiaoDich.CANCELLED);
        bookings.saveAndFlush(booking);
        return reader.getBookingsByUserId(customer.getMaNguoiDung()).stream().filter(b -> b.id().equals(id)).findFirst().orElseThrow();
    }
    // Fresh reads after waiting for the employee lock must see the winner's commit.
    @Transactional(isolation=Isolation.READ_COMMITTED)
    public BookingResponse create(NguoiDung customer, BookingCreateRequest request) {
        PhuongThucThanhToan paymentMethod;
        if ("CASH".equals(request.paymentMethod())) {
            paymentMethod = PhuongThucThanhToan.CASH;
        } else if ("VNPAY".equals(request.paymentMethod())) {
            paymentMethod = PhuongThucThanhToan.VNPAY;
        } else {
            throw invalid("Phương thức thanh toán không hợp lệ.");
        }
        if(customer.getSoDienThoai()==null || customer.getSoDienThoai().isBlank()) throw invalid("Vui lòng cập nhật số điện thoại trước khi đặt lịch.");
        var pet=pets.findByMaThuCungAndNguoiDung_MaNguoiDung(request.petId(),customer.getMaNguoiDung()).orElseThrow(() -> invalid("Thú cưng không thuộc tài khoản của bạn."));
        if(!Integer.valueOf(1).equals(pet.getTrangThai())) throw invalid("Thú cưng không hoạt động.");
        if(new HashSet<>(request.serviceIds()).size()!=request.serviceIds().size()) throw invalid("Dịch vụ bị trùng.");
        var selected=services.findAllById(request.serviceIds());
        if(selected.size()!=request.serviceIds().size() || selected.stream().anyMatch(s -> !Integer.valueOf(1).equals(s.getTrangThai()))) throw invalid("Dịch vụ không hợp lệ.");
        if(selected.size()>1 && selected.stream().anyMatch(s -> s.getLoaiDichVu()==LoaiDichVu.COMBO)) throw invalid("Combo phải được đặt riêng.");
        int duration=selected.stream().mapToInt(DichVu::getThoiLuongPhut).sum();
        if(!validWindow(request.appointmentDate(),request.startTime(),duration)) throw invalid("Ngày hoặc giờ hẹn không hợp lệ.");
        // Serialize bookings for the same employee, then recheck availability inside the transaction.
        var employee=users.lockById(request.employeeId()).orElseThrow(() -> invalid("Không tìm thấy nhân viên."));
        if(staff(request.appointmentDate(),request.startTime(),duration,null).stream().noneMatch(s -> s.get("id").equals(employee.getMaNguoiDung())))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Khung giờ vừa được đặt. Vui lòng chọn lại.");
        var allPrices=prices.findAll();
        List<ChiTietDatLich> lines=new ArrayList<>();
        BigDecimal total=BigDecimal.ZERO;
        for(var service:selected) {
            var matches=allPrices.stream().filter(p -> p.getDichVu().getMaDichVu().equals(service.getMaDichVu())
                && p.getLoaiThuCung()==pet.getLoaiThuCung() && pet.getCanNang().compareTo(p.getCanNangTu())>0 && pet.getCanNang().compareTo(p.getCanNangDen())<=0).toList();
            if(matches.size()!=1) throw invalid("Dịch vụ chưa có mức giá phù hợp với thú cưng.");
            var line=new ChiTietDatLich(); line.setDichVu(service); line.setTenDichVu(service.getTen());
            line.setGia(matches.get(0).getGia()); line.setThoiLuongPhut(service.getThoiLuongPhut()); lines.add(line); total=total.add(line.getGia());
        }
        var booking=new DatLich();
        booking.setCodeDatLich("MEO-"+UUID.randomUUID().toString().replace("-","").substring(0,20));
        booking.setNguoiDung(customer); booking.setTenLienHe(customer.getHoTen()); booking.setSdtLienHe(customer.getSoDienThoai()); booking.setEmailLienHe(customer.getEmail());
        booking.setThuCung(pet); booking.setTenThuCung(pet.getTenThuCung()); booking.setLoaiThuCung(pet.getLoaiThuCung()); booking.setCanNangThuCung(pet.getCanNang());
        booking.setNhanVien(employee); booking.setNgayHen(request.appointmentDate()); booking.setGioBatDau(request.startTime()); booking.setGioKetThuc(request.startTime().plusMinutes(duration));
        booking.setGhiChu(request.note()); booking.setTongTien(total); bookings.save(booking);
        for(var line:lines) line.setDatLich(booking);
        details.saveAll(lines);
        var payment=new ThanhToan(); 
        payment.setDatLich(booking); 
        payment.setPhuongThuc(paymentMethod); 
        payment.setSoTien(total); 
        payments.save(payment);
        BookingResponse response = reader
        .getBookingsByUserId(customer.getMaNguoiDung())
        .stream()
        .filter(item -> item.id().equals(booking.getMaDatLich()))
        .findFirst()
        .orElseThrow();

        eventPublisher.publishEvent(new BookingCreatedEvent(response));

        return response;
    }
}
