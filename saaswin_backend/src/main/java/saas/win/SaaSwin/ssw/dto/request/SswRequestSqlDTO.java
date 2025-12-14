package saas.win.SaaSwin.ssw.dto.request;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SswRequestSqlDTO {
    private Object sqlId;
    private String sql_key;
    //private String scr_itg_no;
    private List<Map<String, Object>> params;
}

