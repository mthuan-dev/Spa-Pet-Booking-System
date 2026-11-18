package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.ThuCung;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ThuCungRepository extends JpaRepository<ThuCung, Integer> {
    List<ThuCung> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);
    Optional<ThuCung> findByMaThuCungAndNguoiDung_MaNguoiDung(Integer maThuCung, Integer maNguoiDung);
}
