package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.enums.VaiTro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from NguoiDung u where u.maNguoiDung = :id")
    Optional<NguoiDung> lockById(@Param("id") Integer id);
    List<NguoiDung> findByVaiTro(VaiTro vaiTro);
    Optional<NguoiDung> findByMaNguoiDungAndVaiTro(Integer maNguoiDung, VaiTro vaiTro);

    Optional<NguoiDung> findByEmail(String email);
    boolean existsBySoDienThoai(String soDienThoai);
    boolean existsBySoDienThoaiAndMaNguoiDungNot(String soDienThoai, Integer maNguoiDung);

    @Query("""
            SELECT u FROM NguoiDung u
            WHERE u.vaiTro = :vaiTro
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(u.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR u.soDienThoai LIKE CONCAT('%', :keyword, '%'))
            """)
    Page<NguoiDung> searchByRoleAndKeyword(
            @Param("vaiTro") VaiTro vaiTro,
            @Param("keyword") String keyword,
            Pageable pageable);
}
