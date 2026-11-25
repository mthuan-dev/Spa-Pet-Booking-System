package com.petspa.petbooking.repository;

import com.petspa.petbooking.entity.DatLich;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;

public interface ReportRepository extends Repository<DatLich, Integer> {
    interface DailyCount { LocalDate getDate(); long getTotalBookings(); }
    interface DailyRevenue { LocalDate getDate(); BigDecimal getRevenue(); }
    interface ServiceTotal { Integer getServiceId(); String getServiceName(); long getTotalBookings(); BigDecimal getRevenue(); }

    @Query(value = """
            select ngayhen as date, count(*) as totalBookings from datlich
            where ngayhen between :start and :end and trangthaidatlich <> 'CANCELLED'
            group by ngayhen
            """, nativeQuery = true)
    List<DailyCount> countDaily(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query(value = """
            select date(thoigianthanhtoan) as date, sum(sotien) as revenue from thanhtoan
            where trangthai = 'SUCCESS' and thoigianthanhtoan >= :start and thoigianthanhtoan < :until
            group by date(thoigianthanhtoan)
            """, nativeQuery = true)
    List<DailyRevenue> revenueDaily(@Param("start") LocalDateTime start, @Param("until") LocalDateTime until);

    @Query(value = """
            select s.madichvu as serviceId, s.ten as serviceName,
              (select count(*) from chitietdatlich d join datlich b on b.madatlich = d.madatlich
                where d.madichvu = s.madichvu and b.trangthaidatlich <> 'CANCELLED'
                  and b.ngayhen between :startDate and :endDate) as totalBookings,
              coalesce((select sum(d.gia * p.sotien / nullif(b.tongtien, 0))
                from chitietdatlich d join datlich b on b.madatlich = d.madatlich
                join thanhtoan p on p.madatlich = b.madatlich
                where d.madichvu = s.madichvu and p.trangthai = 'SUCCESS'
                  and p.thoigianthanhtoan >= :start and p.thoigianthanhtoan < :until), 0) as revenue
            from dichvu s order by s.madichvu
            """, nativeQuery = true)
    List<ServiceTotal> services(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate,
            @Param("start") LocalDateTime start, @Param("until") LocalDateTime until);

    @Query("select count(distinct b.nguoiDung.maNguoiDung) from DatLich b where b.ngayHen between :start and :end and b.trangThaiDatLich <> com.petspa.petbooking.entity.enums.TrangThaiDatLich.CANCELLED")
    long countCustomers(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
