package ru.service.view.dto.event.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DecisionResponse {

    private Long id;
    private DecisionType decisionType;
    private String decisionDescr;
    private Integer difficulty;
    private String decisionLog;
    private String eventTitle;
    private Map<Boolean, DecisionResultResponse> results;
}
