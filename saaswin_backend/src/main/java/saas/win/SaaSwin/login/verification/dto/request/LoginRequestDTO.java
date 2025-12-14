package saas.win.SaaSwin.login.verification.dto.request;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String login_type;
    private String user_id;
    private String pswd;
}
