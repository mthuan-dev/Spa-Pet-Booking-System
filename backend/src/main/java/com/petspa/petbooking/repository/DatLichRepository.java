package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.DatLich;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DatLichRepository extends JpaRepository<DatLich, Integer> {
    @org.springframework.data.jpa.repository.Lock(
            jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query(
            "select b from DatLich b where b.maDatLich = :id")
    java.util.Optional<DatLich> lockById(
            @org.springframework.data.repository.query.Param("id") Integer id);

    @org.springframework.data.jpa.repository.Query(
            value =
                    """
        select distinct b.manhanvien from datlich b
        where b.ngayhen = :date and b.trangthaidatlich in (:statuses)
          and b.giobatdau < cast(:end as time) and b.gioketthuc > cast(:start as time)
          and (:exclude is null or b.madatlich <> :exclude)
        """,
            nativeQuery = true)
    List<Integer> queryBusyEmployeeIds(
            @org.springframework.data.repository.query.Param("date") java.time.LocalDate date,
            @org.springframework.data.repository.query.Param("start") String start,
            @org.springframework.data.repository.query.Param("end") String end,
            @org.springframework.data.repository.query.Param("exclude") Integer exclude,
            @org.springframework.data.repository.query.Param("statuses") List<String> statuses);

    /** Chờ 5 phút sau hạn thanh toán rồi mới đối soát để hủy. */
    java.time.Duration HOLD_GRACE = java.time.Duration.ofMinutes(5);

    @org.springframework.data.jpa.repository.Query(
            """
        select b.maDatLich from DatLich b
        where b.trangThaiDatLich = com.petspa.petbooking.entity.enums.TrangThaiDatLich.PENDING
          and b.trangThaiThanhToan = com.petspa.petbooking.entity.enums.TrangThaiThanhToan.UNPAID
          and b.hanThanhToan is not null and b.hanThanhToan <= :cutoff
        """)
    List<Integer> findExpiredHoldIds(
            @org.springframework.data.repository.query.Param("cutoff")
                    java.time.LocalDateTime cutoff);

    default List<Integer> findBusyEmployeeIds(
            java.time.LocalDate date,
            java.time.LocalTime start,
            java.time.LocalTime end,
            Integer exclude,
            List<com.petspa.petbooking.entity.enums.TrangThaiDatLich> statuses) {
        // Bind wall-clock strings: JDBC TIME parameters otherwise apply jdbc.time_zone,
        // unlike the LOCAL_TIME mapping used when persisting appointment times.
        return queryBusyEmployeeIds(
                date,
                start.format(java.time.format.DateTimeFormatter.ISO_LOCAL_TIME),
                end.format(java.time.format.DateTimeFormatter.ISO_LOCAL_TIME),
                exclude,
                statuses.stream().map(Enum::name).toList());
    }

    List<DatLich> findAllByNguoiDung_MaNguoiDungOrderByNgayHenDesc(Integer userId);
}
