package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.GiaDichVu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GiaDichVuRepository extends JpaRepository<GiaDichVu, Integer> {
    @org.springframework.data.jpa.repository.Query("select p.dichVu.maDichVu from GiaDichVu p where p.maGiaDichVu = :id")
    java.util.Optional<Integer> findServiceId(@org.springframework.data.repository.query.Param("id") Integer id);
    java.util.List<GiaDichVu> findByDichVu_MaDichVuAndLoaiThuCung(
            Integer serviceId, com.petspa.petbooking.entity.enums.LoaiThuCung type);
}
