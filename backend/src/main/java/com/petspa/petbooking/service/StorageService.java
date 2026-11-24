package com.petspa.petbooking.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.URI;
import java.util.Objects;
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
        Path target = null;
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
            target = directory.resolve(filename);
            Files.write(target, bytes);
            return "/uploads/" + folder + "/" + filename;
        } catch (IOException exception) {
            if (target != null) {
                try {
                    Files.deleteIfExists(target);
                } catch (IOException cleanupException) {
                    exception.addSuppressed(cleanupException);
                }
            }
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh.", exception);
        }
    }

    public void deleteImage(String imagePath, String allowedFolder) {
        Path file = resolveImage(imagePath, allowedFolder);
        if (file == null) return;
        try {
            Files.deleteIfExists(file);
        } catch (IOException | SecurityException exception) {
            LOGGER.log(Level.WARNING, "Không thể xóa ảnh cũ: " + imagePath, exception);
        }
    }

    public boolean isSameImage(String first, String second, String folder) {
        if (Objects.equals(first, second)) return true;
        Path file = resolveImage(first, folder);
        return file != null && file.equals(resolveImage(second, folder));
    }

    private Path resolveImage(String imagePath, String folder) {
        if (imagePath == null || !ALLOWED_FOLDERS.contains(folder)) return null;
        String path = imagePath;
        try {
            URI uri = URI.create(imagePath);
            if (uri.isAbsolute()) {
                if (!isCurrentServer(uri)) return null;
                path = uri.getPath();
            }
        } catch (IllegalArgumentException exception) {
            return null;
        }
        if (path == null) return null;
        String prefix = "/uploads/" + folder + "/";
        String legacyPrefix = "/api/booking-data/pet-images/";
        String filename;
        if (path.startsWith(prefix)) filename = path.substring(prefix.length());
        else if ("pets".equals(folder) && path.startsWith(legacyPrefix)) filename = path.substring(legacyPrefix.length());
        else return null;
        if (!filename.matches("[a-zA-Z0-9][a-zA-Z0-9_-]*\\.(?:jpg|jpeg|png|webp)")) return null;
        return Paths.get(uploadDir, folder).toAbsolutePath().normalize().resolve(filename);
    }

    private boolean isCurrentServer(URI uri) {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) return false;
        var request = attributes.getRequest();
        int port = uri.getPort() == -1 ? ("https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80) : uri.getPort();
        return request.getScheme().equalsIgnoreCase(uri.getScheme())
                && request.getServerName().equalsIgnoreCase(uri.getHost())
                && request.getServerPort() == port;
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
