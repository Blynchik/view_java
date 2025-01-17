package ru.service.view.controller;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.service.view.client.HeroApi;
import ru.service.view.dto.hero.HeroRequest;
import ru.service.view.dto.hero.HeroResponse;

@RestController
@RequestMapping("/api/hero")
@Slf4j
public class HeroController {

    private final HeroApi heroApi;

    @Autowired
    public HeroController(HeroApi heroApi) {
        this.heroApi = heroApi;
    }

    @PostMapping()
    @CircuitBreaker(name = "defaultCircuitBreaker")
    public ResponseEntity<HeroResponse> create(@RequestHeader(value = "Authorization") String authorizationHeader,
                                               @RequestBody HeroRequest heroRequest) {
        log.info("Request to POST /api/hero");
        return heroApi.create(authorizationHeader, heroRequest);
    }

    @GetMapping
    @CircuitBreaker(name = "defaultCircuitBreaker")
    public ResponseEntity<HeroResponse> getOwn(@RequestHeader(value = "Authorization") String authorizationHeader) {
        log.info("Request to GET /api/hero");
        return heroApi.getOwn(authorizationHeader);
    }
}
