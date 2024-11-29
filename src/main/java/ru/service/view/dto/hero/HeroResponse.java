package ru.service.view.dto.hero;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HeroResponse {
    private Long id;
    private String name;
    private String lastname;
    private Date createdAt;
    private Long userId;
    private Integer str;
    private Integer dex;
    private Integer con;
    private Integer intl;
    private Integer wis;
    private Integer cha;
}
