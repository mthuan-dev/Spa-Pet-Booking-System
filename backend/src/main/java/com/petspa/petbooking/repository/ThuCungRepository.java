package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.ThuCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface ThuCungRepository extends JpaRepository<ThuCung, Integer> {
    List<ThuCung> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);
    Optional<ThuCung> findByMaThuCungAndNguoiDung_MaNguoiDung(Integer maThuCung, Integer maNguoiDung);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ThuCung p where p.maThuCung = :petId and p.nguoiDung.maNguoiDung = :customerId")
    Optional<ThuCung> lockByIdAndCustomerId(@Param("petId") Integer petId, @Param("customerId") Integer customerId);
}
