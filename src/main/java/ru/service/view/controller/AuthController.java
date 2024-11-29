package ru.service.view.controller;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.service.view.client.AuthApi;
import ru.service.view.dto.auth.*;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    //todo
    // сделать поддержку eureka и gateway
    // не хранить токены в localStorage (если будет веб-версия)
    // возможно стоит сделать хранение refresh токена с помощью Spring Sessions или отправлять его в куки (если будет веб-версия)
    // убрать html в url (если будет веб-версия)
    // блокирование кнопок во время колеса ожидания
    // при 401 и 403 перебрасывать на страницу логина

    private final AuthApi authApi;

    @Autowired
    public AuthController(AuthApi authApi) {
        this.authApi = authApi;
    }

    @PostMapping("/token")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    public ResponseEntity<AccessTokenResponse> getAccessToken(@RequestBody AccessTokenRequest accessTokenRequest) {
        log.info("Request to POST /api/auth/token");
        return authApi.getAccessToken(accessTokenRequest);
    }

    @PostMapping("/registration")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    public ResponseEntity<AppUserResponse> registration(@RequestBody AppUserRequest userDto) {
        log.info("Request to POST /api/auth/registration");
        return authApi.registration(userDto);
    }

    @PostMapping("/login")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    public ResponseEntity<AuthResponse> login(@RequestBody AppUserRequest userDto) {
        log.info("Request to POST /api/auth/login from: {}", userDto.getLogin());
        return authApi.login(userDto);
    }
}