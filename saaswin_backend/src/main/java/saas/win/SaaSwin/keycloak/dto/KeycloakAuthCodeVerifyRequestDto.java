package saas.win.SaaSwin.keycloak.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 인증 코드 검증을 위한 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakAuthCodeVerifyRequestDto {
    /**
     * 사용자명
     */
    private String username;
    
    /**
     * 인증 코드 (6자리 난수)
     */
    private String authCode;
    
    /**
     * 사용자 비밀번호
     */
    private String password;

    /**
     * 사용자 번호
     */
    private String user_no;
} 