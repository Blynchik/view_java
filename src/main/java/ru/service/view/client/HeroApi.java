package ru.service.view.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import ru.service.view.config.FeignClientConfig;
import ru.service.view.dto.hero.HeroRequest;
import ru.service.view.dto.hero.HeroResponse;

@FeignClient(name = "hero", configuration = FeignClientConfig.class)
public interface HeroApi {

    @PostMapping
    @CircuitBreaker(name = "defaultCircuitBreaker")
    ResponseEntity<HeroResponse> create(@RequestHeader(value = "Authorization") String authorizationHeader,
                                        @RequestBody HeroRequest heroRequest);

    @GetMapping
    @CircuitBreaker(name = "defaultCircuitBreaker")
    ResponseEntity<HeroResponse> getOwn(@RequestHeader(value = "Authorization") String authorizationHeader);
}
