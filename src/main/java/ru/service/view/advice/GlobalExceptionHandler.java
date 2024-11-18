package ru.service.view.advice;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;
import ru.service.view.dto.ExceptionInfo;
import ru.service.view.dto.ExceptionResponse;

import java.util.List;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private final ObjectMapper objectMapper;

    @Autowired
    public GlobalExceptionHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @ExceptionHandler(CallNotPermittedException.class)
    public ResponseEntity<ExceptionResponse> handleCallNotPermitException(CallNotPermittedException ex) {
        logException(ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ExceptionResponse(
                        List.of(new ExceptionInfo(ex.getClass().getSimpleName(),
                                "",
                                "The server is overloaded, try again later"))));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ExceptionResponse> handleFeignException(ResponseStatusException ex) {
        logException(ex);
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(deserializeExceptionResponseFromResponseStatusException(ex));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleException(Exception ex) {
        logException(ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ExceptionResponse(getExceptionInfoList(ex)));
    }

    private List<ExceptionInfo> getExceptionInfoList(Exception e) {
        return List.of(new ExceptionInfo(e.getClass().getSimpleName(), "", e.getMessage()));
    }

    private ExceptionResponse deserializeExceptionResponseFromResponseStatusException(ResponseStatusException e) {
        ExceptionResponse exceptionResponse = null;
        try {
            String json = e.getMessage().substring(e.getMessage().indexOf("{"), e.getMessage().length() - 1);
            exceptionResponse = objectMapper.readValue(json, ExceptionResponse.class);
        } catch (Exception ex) {
            handleException(ex);
        }
        return exceptionResponse;
    }

    private void logException(Exception e) {
        log.error("""
                exception: {}, message: {}
                """, e.getClass().getSimpleName(), e.getMessage());
        e.printStackTrace();
    }
}
