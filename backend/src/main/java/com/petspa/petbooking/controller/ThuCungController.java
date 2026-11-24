package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.ThuCungRequest;
import com.petspa.petbooking.dto.response.ThuCungListResponse;
import com.petspa.petbooking.dto.response.ThuCungResponse;
import com.petspa.petbooking.service.ThuCungService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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

    @PostMapping(value = "/{customerId}/pets", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ThuCungResponse createPet(@PathVariable Integer customerId, @Valid @RequestBody ThuCungRequest request) {
        return thuCungService.createPet(customerId, request);
    }

    @PostMapping(value = "/{customerId}/pets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ThuCungResponse createPetWithImage(
            @PathVariable Integer customerId,
            @Valid @RequestPart("pet") ThuCungRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return thuCungService.createPet(customerId, request, file);
    }

    @PutMapping(value = "/{customerId}/pets/{petId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ThuCungResponse updatePet(
            @PathVariable Integer customerId,
            @PathVariable Integer petId,
            @Valid @RequestBody ThuCungRequest request) {
        return thuCungService.updatePet(customerId, petId, request);
    }

    @PutMapping(value = "/{customerId}/pets/{petId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ThuCungResponse updatePetWithImage(
            @PathVariable Integer customerId,
            @PathVariable Integer petId,
            @Valid @RequestPart("pet") ThuCungRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return thuCungService.updatePet(customerId, petId, request, file);
    }

    @DeleteMapping("/{customerId}/pets/{petId}")
    public ThuCungResponse disablePet(@PathVariable Integer customerId, @PathVariable Integer petId) {
        return thuCungService.disablePet(customerId, petId);
    }
}
