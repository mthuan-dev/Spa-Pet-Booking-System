package com.petspa.petbooking.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import com.petspa.petbooking.service.StorageService;

@RestController
@RequestMapping("/api")
public class ImageUploadController {
    private final StorageService storageService;

    public ImageUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/service-images")
    public Map<String, String> uploadServiceImage(@RequestParam("file") MultipartFile file) {
        return Map.of("hinhanh", storageService.storeImage(file, "services"));
    }

    @PostMapping("/pet-images")
    public Map<String, String> uploadPetImage(@RequestParam("file") MultipartFile file) {
        return Map.of("hinhAnh", storageService.storeImage(file, "pets"));
    }
}
