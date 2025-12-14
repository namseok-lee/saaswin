package saas.win.SaaSwin.aligo.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AligoDTO {     // DB insert용으로 사용
//    private String user_no;
    private String user_no;
    private String scr_itg_no;

    private String sndr_api;
    private String sndr_id;

    private String sndr_profile;
    private String sndr_telno;
    private String nt_tmplt;
    private String rsvt_dt;
    private String rcvr_telno;

    private String rcvr_flnm;
    private String nt_tit;
    private String nt_cn;
    private String empas_tit;
    private String btn_info;

    private String fail_sndr_yn;
    private String fail_sndr_tit;
    private String fail_sndr_cn;
    private String test_yn;
    private String rslt_cd;

    private String rslt_msg;
    private String rslt_info;





}
