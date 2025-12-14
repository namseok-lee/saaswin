package saas.win.SaaSwin.code.dto;

import lombok.Data;

import java.util.Map;

@Data
public class CodeDTO {
    private String group_cd; // "hrs_group00263"
    private String rprs_ognz_no; // "WIN"
    private String use_yn; // 없다면 "Y"

    private String search_ymd; // 기준일
    
    private String bgng_ymd;
    private String end_ymd;
}
