package saas.win.SaaSwin.login.passwordReset.dto.request;

import lombok.Data;

import java.util.Map;

@Data
public class ResetPasswordRequestDTO {
    private String user_id;
    private String user_no;
    private String rprs_ognz_no;
    private Map<String,Object> encrypt_pswd;

}
