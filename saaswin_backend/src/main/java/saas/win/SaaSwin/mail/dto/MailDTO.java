package saas.win.SaaSwin.mail.dto;

import lombok.Data;


import java.util.List;

@Data
public class MailDTO {
    private String sndpty_eml_addr;     // 발신자 이메일주소
    // 인증을 위해서는 발신자 인증을 위해 비밀번호도 필요함(starttls)
    private List<String> rcvr_eml_addr;    // 수신자 이메일주소 []
    private List<String> referrer_eml_addr;  // 참조자 이메일주소 []
    private String tmplt_no;    // 메일 템플릿 번호
    private String eml_ttl;      // 메일제목
    private String eml_cn;      // 메일내용

    private String user_no;
    private String rprs_ognz_no;

//    private Map<String, Object> param;
}
