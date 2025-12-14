package saas.win.SaaSwin.login.passwordReset.dto.request;

import lombok.Data;

@Data
public class AuthCodeRequestDTO {
    private String authCode;
    private String rprs_ognz_no;
    private String user_id;
}
