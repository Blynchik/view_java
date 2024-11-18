package ru.service.view.config;

import org.springframework.web.server.ResponseStatusException;

import java.util.function.Predicate;

public class ClientRecordFailurePredicate implements Predicate<Throwable> {
    @Override
    public boolean test(Throwable throwable) {
        // Если это ResponseStatusException, проверяем код статуса
        if (throwable instanceof ResponseStatusException) {
            int status = ((ResponseStatusException) throwable).getStatusCode().value();
            // Игнорировать все ошибки 4xx, например:
            if (status >= 400 && status < 500) {
                return false; // НЕ учитываем это как failure для Circuit Breaker
            }
        }
        // Для всех остальных ошибок считаем вызов ошибочным
        return true;
    }
}
