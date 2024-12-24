package ru.service.view.controller;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.service.view.client.EventApi;
import ru.service.view.dto.event.common.EventResponse;

@RestController
@RequestMapping("/api/event")
@Slf4j
public class EventController {

    //todo
    // не добавлены права администратора на создание события

    private final EventApi eventApi;

    @Autowired
    public EventController(EventApi eventApi) {
        this.eventApi = eventApi;
    }

    @GetMapping("/random")
    @CircuitBreaker(name = "defaultCircuitBreaker")
    public ResponseEntity<EventResponse> getRandom(@RequestHeader(value = "Authorization") String authorizationHeader) {
        log.info("Request to GET /api/event/random");
        return eventApi.getRandom(authorizationHeader);
    }
}
