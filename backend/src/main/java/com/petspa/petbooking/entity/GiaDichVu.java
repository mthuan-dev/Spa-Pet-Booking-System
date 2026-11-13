package com.petspa.petbooking.entity;

import com.petspa.petbooking.entity.enums.LoaiThuCung;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "giadichvu", uniqueConstraints = @UniqueConstraint(
        name = "uq_giadichvu_mucgia", columnNames = {"madichvu", "loaithucung", "cannangtu", "cannangden"}))
public class GiaDichVu {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "magiadichvu")
    private Integer maGiaDichVu;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "madichvu", nullable = false)
    private DichVu dichVu;
    @Enumerated(EnumType.STRING) @Column(name = "loaithucung", nullable = false, length = 5)
    private LoaiThuCung loaiThuCung;
    @Column(name = "cannangtu", nullable = false, precision = 5, scale = 2)
    private BigDecimal canNangTu;
    @Column(name = "cannangden", nullable = false, precision = 5, scale = 2)
    private BigDecimal canNangDen;
    @Column(name = "gia", nullable = false, precision = 12, scale = 2)
    private BigDecimal gia;

    public GiaDichVu() {}
    public Integer getMaGiaDichVu() { return maGiaDichVu; }
    public void setMaGiaDichVu(Integer maGiaDichVu) { this.maGiaDichVu = maGiaDichVu; }
    public DichVu getDichVu() { return dichVu; }
    public void setDichVu(DichVu dichVu) { this.dichVu = dichVu; }
    public LoaiThuCung getLoaiThuCung() { return loaiThuCung; }
    public void setLoaiThuCung(LoaiThuCung loaiThuCung) { this.loaiThuCung = loaiThuCung; }
    public BigDecimal getCanNangTu() { return canNangTu; }
    public void setCanNangTu(BigDecimal canNangTu) { this.canNangTu = canNangTu; }
    public BigDecimal getCanNangDen() { return canNangDen; }
    public void setCanNangDen(BigDecimal canNangDen) { this.canNangDen = canNangDen; }
    public BigDecimal getGia() { return gia; }
    public void setGia(BigDecimal gia) { this.gia = gia; }
}
