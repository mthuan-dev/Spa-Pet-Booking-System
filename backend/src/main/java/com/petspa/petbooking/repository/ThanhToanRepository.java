package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.ThanhToan;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ThanhToanRepository
        extends JpaRepository<ThanhToan, Integer> {

    List<ThanhToan> findAllByDatLich_MaDatLich(Integer bookingId);

    @Query("""
        select p.datLich.maDatLich
        from ThanhToan p
        where p.vnpTxnRef = :reference
        """)
    Optional<Integer> findBookingIdByReference(
            @Param("reference") String reference
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select p
        from ThanhToan p
        where p.vnpTxnRef = :reference
        """)
    Optional<ThanhToan> lockByReference(
            @Param("reference") String reference
    );
}