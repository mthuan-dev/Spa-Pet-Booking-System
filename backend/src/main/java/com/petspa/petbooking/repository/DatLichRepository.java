package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.DatLich;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DatLichRepository extends JpaRepository<DatLich, Integer> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select b from DatLich b where b.maDatLich = :id")
    java.util.Optional<DatLich> lockById(@org.springframework.data.repository.query.Param("id") Integer id);
    // TODO: Add queries when booking features are implemented.
    List<DatLich> findAllByNguoiDung_MaNguoiDungOrderByNgayHenDesc(Integer userId);
}
