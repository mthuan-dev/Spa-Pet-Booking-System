package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.enums.VaiTro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    List<NguoiDung> findByVaiTro(VaiTro vaiTro);
    Optional<NguoiDung> findByMaNguoiDungAndVaiTro(Integer maNguoiDung, VaiTro vaiTro);

    Optional<NguoiDung> findByEmail(String email);
}
