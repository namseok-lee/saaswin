package saas.win.SaaSwin.login.passwordReset.dto.request;

import lombok.Data;

@Data
public class InfoCheckRequestDTO {
    private String user_id; // 아이디
    private String brdt; // 생일
    private String telno; // 핸드폰 번호
}
