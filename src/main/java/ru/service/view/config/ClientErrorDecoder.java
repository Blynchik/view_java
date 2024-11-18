package ru.service.view.config;

import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

@Component
@Slf4j
public class ClientErrorDecoder implements ErrorDecoder {

    @Override
    public Exception decode(String methodKey, Response response) {
        log.info("An error was received from the server");
        // Считываем тело ответа при ошибке
        String errorBody = null;
        try {
            errorBody = new BufferedReader(new InputStreamReader(response.body().asInputStream()))
                    .lines().collect(Collectors.joining("\n"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // Пробрасываем исходный ответ сервера с кодом ошибки
        return new ResponseStatusException(
                HttpStatus.valueOf(response.status()),
                errorBody
        );
    }
}