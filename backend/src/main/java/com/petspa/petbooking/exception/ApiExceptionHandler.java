package com.petspa.petbooking.exception;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("detail",e.getReason()==null?"Yêu cầu không hợp lệ.":e.getReason()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest().body(Map.of("detail","Dữ liệu không hợp lệ: "+e.getBindingResult().getFieldErrors().stream().map(f -> f.getField()+" "+f.getDefaultMessage()).findFirst().orElse("")));
    }
}
