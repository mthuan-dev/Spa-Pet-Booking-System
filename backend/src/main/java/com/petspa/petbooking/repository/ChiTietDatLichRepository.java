package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.ChiTietDatLich;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChiTietDatLichRepository extends JpaRepository<ChiTietDatLich, Integer> {
    List<ChiTietDatLich> findAllByDatLich_MaDatLich(Integer bookingId);
}
