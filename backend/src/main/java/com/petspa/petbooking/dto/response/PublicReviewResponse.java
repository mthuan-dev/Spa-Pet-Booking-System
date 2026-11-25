package com.petspa.petbooking.dto.response;

public record PublicReviewResponse(Integer id, Integer rating, String comment, String userName, String petName) {}
