package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    java.util.Optional<DanhGia> findByDatLich_MaDatLich(Integer id);
    java.util.List<DanhGia> findTop3BySoSaoAndIsHiddenOrderByNgayTaoDescMaDanhGiaDesc(Integer rating, Integer hidden);
}
