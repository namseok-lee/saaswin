package saas.win.SaaSwin.login.passwordReset.dto.request;

import lombok.Data;

@Data
public class AuthenticationCheckDTO {
    private String user_id;
    private String verificationCode;
}
