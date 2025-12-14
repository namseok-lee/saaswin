package saas.win.SaaSwin.google.calendar.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GoogleCalendarDTO {
    private String calnd_id;
    private String cn;
    private String creatr_eml;
    private String ocrn_type;
    private String schdl_bgng_ymd;
    private String schdl_end_ymd;
    private String crt_dt;

    private Map<String, Object> sys_col_info;

    private String ttl;
    private String usre_no;
}
