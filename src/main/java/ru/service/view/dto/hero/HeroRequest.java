package ru.service.view.dto.hero;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HeroRequest {

    private String name;
    private String lastname;
    private Integer str;
    private Integer dex;
    private Integer con;
    private Integer intl;
    private Integer wis;
    private Integer cha;
}
