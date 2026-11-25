package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.DichVu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DichVuRepository extends JpaRepository<DichVu, Integer> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select s from DichVu s where s.maDichVu = :id")
    java.util.Optional<DichVu> lockById(@org.springframework.data.repository.query.Param("id") Integer id);
}
