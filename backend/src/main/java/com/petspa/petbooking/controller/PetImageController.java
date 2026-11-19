package com.petspa.petbooking.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import java.nio.file.*;
import java.util.*;
import java.io.*;
import javax.imageio.ImageIO;

@RestController
@RequestMapping("/api/booking-data/pet-images")
public class PetImageController {
    private final Path directory=Path.of("uploads","pets").toAbsolutePath().normalize();
    @PostMapping
    public Map<String,String> upload(@RequestBody Map<String,String> request) throws IOException {
        String image=request.getOrDefault("image", "");
        int comma=image.indexOf(',');
        if(!image.startsWith("data:image/") || comma<0 || image.length()>2800000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Ảnh không hợp lệ hoặc vượt quá 2 MB.");
        byte[] bytes;
        try { bytes=Base64.getDecoder().decode(image.substring(comma+1)); }
        catch(IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Ảnh không hợp lệ."); }
        if(bytes.length>2*1024*1024) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Ảnh quá lớn.");
        var decoded=ImageIO.read(new ByteArrayInputStream(bytes));
        if(decoded==null || decoded.getWidth()>10000 || decoded.getHeight()>10000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Ảnh không hợp lệ.");
        Files.createDirectories(directory);
        String name=UUID.randomUUID()+".png";
        ImageIO.write(decoded,"png",directory.resolve(name).toFile());
        return Map.of("url","/api/booking-data/pet-images/"+name);
    }
    @GetMapping("/{name}")
    public ResponseEntity<byte[]> get(@PathVariable String name) throws IOException {
        if(!name.matches("[a-f0-9-]{36}\\.png") || !Files.exists(directory.resolve(name))) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(Files.readAllBytes(directory.resolve(name)));
    }
}
