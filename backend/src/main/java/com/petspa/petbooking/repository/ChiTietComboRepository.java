package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.ChiTietCombo;
import com.petspa.petbooking.entity.ChiTietComboId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietComboRepository extends JpaRepository<ChiTietCombo, ChiTietComboId> {
    java.util.List<ChiTietCombo> findById_MaCombo(Integer comboId);
}
