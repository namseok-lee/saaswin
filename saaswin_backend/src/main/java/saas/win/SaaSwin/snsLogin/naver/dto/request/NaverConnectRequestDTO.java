package saas.win.SaaSwin.snsLogin.naver.dto.request;

import lombok.Data;

@Data
public class NaverConnectRequestDTO {
    private String login_type; // naver_info
    private String sns_id; // 네이버 고유 id 값
    private String sns_user; // 이메일 아이디
    private String user_no; // 로그인 되어 있을때 전역변수로 받아옴
}
