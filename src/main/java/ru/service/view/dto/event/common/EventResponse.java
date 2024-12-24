package ru.service.view.dto.event.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private List<DecisionResponse> decisions;
}
