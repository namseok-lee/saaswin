package saas.win.SaaSwin.ssw.dto.request;

import lombok.Data;

import java.util.Map;

@Data
public class SswRequestObjectDTO {
    private String scr_itg_no;
    //private String scr_no;
    private String scr_type_cd; // scr_itg_no 과 값 동일

    // 화면정보 불러올 param
    private String scr_no;
    private String scr_prord;
    private String rprs_ognz_no;

    private String user_no;
    private String menu_no;

    private String companyCd;
    private String objectId;

    private Map<String, Object> data_se_info;
    private Map<String, Object> selectedRow;
}
