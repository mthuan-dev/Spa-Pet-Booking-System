package com.petspa.petbooking.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class StorageService {
    private static final Logger LOGGER = Logger.getLogger(StorageService.class.getName());
    private static final long MAX_IMAGE_BYTES = 2 * 1024 * 1024;
    private static final Set<String> ALLOWED_FOLDERS = Set.of("pets", "services");

    private final String uploadDir;

    public StorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public String storeImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw badRequest("Vui lòng chọn ảnh.");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw badRequest("Ảnh tối đa 2 MB.");
        }
        if (!ALLOWED_FOLDERS.contains(folder)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thư mục lưu ảnh không hợp lệ.");
        }
        try {
            byte[] bytes = file.getBytes();
            String extension = detectExtension(bytes);
            if (extension == null) {
                throw badRequest("Vui lòng chọn ảnh JPG, PNG hoặc WebP.");
            }
            if (!isDecodableImage(bytes)) {
                throw badRequest("Nội dung tệp không phải ảnh hợp lệ.");
            }

            Path directory = Paths.get(uploadDir, folder).toAbsolutePath().normalize();
            Files.createDirectories(directory);
            String filename = UUID.randomUUID() + "." + extension;
            Files.write(directory.resolve(filename), bytes);
            return "/uploads/" + folder + "/" + filename;
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh.", exception);
        }
    }

    public void deleteImage(String imagePath, String allowedFolder) {
        if (imagePath == null || !imagePath.startsWith("/uploads/" + allowedFolder + "/")) return;
        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path file = root.resolve(imagePath.substring("/uploads/".length())).normalize();
            if (file.startsWith(root)) Files.deleteIfExists(file);
        } catch (IOException exception) {
            LOGGER.log(Level.WARNING, "Không thể xóa ảnh cũ: " + imagePath, exception);
        }
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static String detectExtension(byte[] h) {
        if (h.length >= 3
                && (h[0] & 0xFF) == 0xFF
                && (h[1] & 0xFF) == 0xD8
                && (h[2] & 0xFF) == 0xFF) return "jpg";
        if (h.length >= 8
                && (h[0] & 0xFF) == 0x89
                && h[1] == 'P'
                && h[2] == 'N'
                && h[3] == 'G'
                && h[4] == 0x0D
                && h[5] == 0x0A
                && h[6] == 0x1A
                && h[7] == 0x0A) return "png";
        if (h.length >= 12
                && h[0] == 'R'
                && h[1] == 'I'
                && h[2] == 'F'
                && h[3] == 'F'
                && h[8] == 'W'
                && h[9] == 'E'
                && h[10] == 'B'
                && h[11] == 'P') return "webp";
        return null;
    }

    private static boolean isDecodableImage(byte[] bytes) {
        try (ByteArrayInputStream input = new ByteArrayInputStream(bytes)) {
            return ImageIO.read(input) != null;
        } catch (IOException exception) {
            return false;
        }
    }
}
