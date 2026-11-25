package com.petspa.petbooking.exception;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.Map;
import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.graphql.execution.ErrorType;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
            org.springframework.web.bind.MissingServletRequestParameterException.class})
    public ResponseEntity<?> malformed(Exception exception) {
        return ResponseEntity.badRequest().body(Map.of("detail", "Dữ liệu hoặc tham số yêu cầu không hợp lệ."));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<?> conflict(Exception exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("detail", "Dữ liệu bị trùng hoặc đang được sử dụng. Vui lòng tải lại và thử lại."));
    }

    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<?> uploadSize(Exception exception) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of("detail", "Ảnh tối đa 2 MB."));
    }
    @GraphQlExceptionHandler(ResponseStatusException.class)
    public GraphQLError graphQlStatus(ResponseStatusException e) {
        int status = e.getStatusCode().value();
        return GraphqlErrorBuilder.newError()
                .errorType(status >= 400 && status < 500 ? ErrorType.BAD_REQUEST : ErrorType.INTERNAL_ERROR)
                .message(status < 500 && e.getReason() != null ? e.getReason() : "Không thể xử lý yêu cầu.")
                .extensions(Map.of("status", status))
                .build();
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("detail",e.getReason()==null?"Yêu cầu không hợp lệ.":e.getReason()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest().body(Map.of("detail","Dữ liệu không hợp lệ: "+e.getBindingResult().getFieldErrors().stream().map(f -> f.getField()+" "+f.getDefaultMessage()).findFirst().orElse("")));
    }
}
