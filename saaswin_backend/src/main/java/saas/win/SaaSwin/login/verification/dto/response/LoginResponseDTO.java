package saas.win.SaaSwin.login.verification.dto.response;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private String accessToken; // 이후에 토큰 만들어서 전달
    private String user_no; // 유저 정보
    private String ognz_no; // 부서 정보
    private String rprs_ognz_no; // 회사 정보
}
