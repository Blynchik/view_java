package ru.service.view.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import ru.service.view.config.FeignClientConfig;
import ru.service.view.dto.auth.*;

@FeignClient(name = "auth", configuration = FeignClientConfig.class)
public interface AuthApi {

    @PostMapping("/registration")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    ResponseEntity<AppUserResponse> registration(@RequestBody AppUserRequest userDto);

    @PostMapping("/login")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    ResponseEntity<AuthResponse> login(@RequestBody AppUserRequest userDto);

    @PostMapping("/token")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    ResponseEntity<AccessTokenResponse> getAccessToken(@RequestBody AccessTokenRequest accessTokenRequest);
}
