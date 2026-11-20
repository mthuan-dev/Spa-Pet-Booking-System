package com.petspa.petbooking.mail;

import com.petspa.petbooking.dto.response.BookingResponse;

public record BookingCreatedEvent(BookingResponse booking) {
}