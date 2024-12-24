package ru.service.view.dto.event.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DecisionResponse {

    private Long id;
    private DecisionType decisionType;
    private String description;
    private String decisionLog;
    private Integer difficulty;
    private String eventTitle;
}
