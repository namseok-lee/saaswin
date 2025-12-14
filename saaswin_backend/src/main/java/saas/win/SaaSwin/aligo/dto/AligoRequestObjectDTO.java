package saas.win.SaaSwin.aligo.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AligoRequestObjectDTO {    // insert용 DTO로 변환
    private String rcvr_flnm;
    private String rcvr_telno;

    private String nt_tit;
    private String nt_cn;

    private String empas_tit;

    private String btn_info;

    private String user_no;
    private String scr_itg_no;

    private String jbps_nm;

}
