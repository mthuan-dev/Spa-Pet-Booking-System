package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.response.PublicReviewResponse;
import com.petspa.petbooking.service.PublicReviewService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/reviews")
public class PublicReviewController {
    private final PublicReviewService service;

    public PublicReviewController(PublicReviewService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicReviewResponse> getLatest() {
        return service.getLatest();
    }
}
