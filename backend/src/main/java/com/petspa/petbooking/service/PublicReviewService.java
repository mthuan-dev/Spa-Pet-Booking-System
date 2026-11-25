package com.petspa.petbooking.service;

import com.petspa.petbooking.dto.response.PublicReviewResponse;
import com.petspa.petbooking.repository.DanhGiaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PublicReviewService {
    private final DanhGiaRepository reviews;
    public PublicReviewService(DanhGiaRepository reviews) { this.reviews = reviews; }

    @Transactional(readOnly = true)
    public List<PublicReviewResponse> getLatest() {
        return reviews.findTop3ByIsHiddenOrderByNgayTaoDesc(0).stream().map(review ->
                new PublicReviewResponse(review.getMaDanhGia(), review.getSoSao(), review.getBinhLuan(),
                        review.getDatLich().getTenLienHe(), review.getDatLich().getTenThuCung())).toList();
    }
}
