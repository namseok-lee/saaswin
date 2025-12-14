package saas.win.SaaSwin.ssw.dto.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SswResponseDetailObjectDataDTO {
    private String scr_itg_no;
    private String scr_no;
    private String scr_type_cd;

    private String scr_tit;

    private Map<String, Object> data_se_info;

    private List<Map<String, Object>> srch_btn_info;
    private List<Map<String, Object>> srch_info;

    private Map<String, Object> grid_tit_info;
    private List<Map<String, Object>> grid_btn_info;
    private List<Map<String, Object>> grid_info;

    private Map<String, Object> table_tit_info;
    private List<Map<String, Object>> table_btn_info;
    private List<Map<String, Object>> table_info;

    private List<Map<String, Object>> tab_info;

    private List<Map<String, Object>> sys_col_info;

    private String data_se_cd;
    private String srvc_no;
}
