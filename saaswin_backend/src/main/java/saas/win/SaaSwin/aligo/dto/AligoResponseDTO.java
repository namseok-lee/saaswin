package saas.win.SaaSwin.aligo.dto;

import lombok.Data;

@Data
public class AligoResponseDTO {     // DB insert용으로 사용

    private String nt_mid;
    private String rcvr_telno;
    private String sms_mid;
    private String nt_rslt_info;
    private String md_mid;
    private String sms_cn;
    private String sms_rslt_info;
    private String email_send_yn;

}
