package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.ThuCungRequest;
import com.petspa.petbooking.dto.response.ThuCungListResponse;
import com.petspa.petbooking.dto.response.ThuCungResponse;
import com.petspa.petbooking.service.ThuCungService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class ThuCungController {
    private final ThuCungService thuCungService;
    public ThuCungController(ThuCungService thuCungService) {
        this.thuCungService = thuCungService;
    }

    @GetMapping("/{customerId}/pets")
    public ThuCungListResponse getPets(@PathVariable Integer customerId) {
        return thuCungService.getPets(customerId);
    }

    @PostMapping("/{customerId}/pets")
    public ThuCungResponse createPet(@PathVariable Integer customerId, @Valid @RequestBody ThuCungRequest request) {
        return thuCungService.createPet(customerId, request);
    }

    @PutMapping("/{customerId}/pets/{petId}")
    public ThuCungResponse updatePet(
            @PathVariable Integer customerId,
            @PathVariable Integer petId,
            @Valid @RequestBody ThuCungRequest request) {
        return thuCungService.updatePet(customerId, petId, request);
    }

    @DeleteMapping("/{customerId}/pets/{petId}")
    public ThuCungResponse disablePet(@PathVariable Integer customerId, @PathVariable Integer petId) {
        return thuCungService.disablePet(customerId, petId);
    }
}
