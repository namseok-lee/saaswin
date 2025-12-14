package saas.win.SaaSwin.snsLogin.naver.dto.request;

import lombok.Data;

@Data
public class NaverCodeRequestDTO {
    private String code;
    private String state;
}
