package ru.service.view.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import ru.service.view.config.FeignClientConfig;
import ru.service.view.dto.event.common.EventResponse;

@FeignClient(name = "event", configuration = FeignClientConfig.class)
public interface EventApi {
    @GetMapping("/random")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    ResponseEntity<EventResponse> getRandom(@RequestHeader(value = "Authorization") String authorizationHeader);
}
