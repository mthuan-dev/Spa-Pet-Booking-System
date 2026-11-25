package com.petspa.petbooking.controller;

import com.petspa.petbooking.dto.request.*;
import com.petspa.petbooking.dto.response.*;
import com.petspa.petbooking.service.DichVuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DichVuController {
    private final DichVuService dichVuService;

    public DichVuController(DichVuService dichVuService) {
        this.dichVuService = dichVuService;
    }

    @GetMapping("/services")
    public DanhMucDichVuResponse getCatalog() {
        return dichVuService.getCatalog();
    }

    @PostMapping("/services")
    @ResponseStatus(HttpStatus.CREATED)
    public DichVuResponse create(@Valid @RequestBody DichVuRequest request) {
        return dichVuService.createService(request);
    }

    @PutMapping("/services/{id}")
    public DichVuResponse update(@PathVariable Integer id, @Valid @RequestBody DichVuRequest request) {
        return dichVuService.updateService(id, request);
    }

    @PostMapping("/service-prices")
    @ResponseStatus(HttpStatus.CREATED)
    public GiaDichVuResponse createPrice(@Valid @RequestBody GiaDichVuRequest request) {
        return dichVuService.createPrice(request);
    }

    @PutMapping("/service-prices/{id}")
    public GiaDichVuResponse updatePrice(@PathVariable Integer id, @Valid @RequestBody GiaDichVuRequest request) {
        return dichVuService.updatePrice(id, request);
    }

    @DeleteMapping("/service-prices/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePrice(@PathVariable Integer id) {
        dichVuService.deletePrice(id);
    }
}
