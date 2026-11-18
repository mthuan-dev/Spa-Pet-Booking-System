package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {
    List<ThanhToan> findAllByDatLich_MaDatLich(Integer bookingId);
}
