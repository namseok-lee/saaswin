package saas.win.SaaSwin.keycloak.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakUserIdResponseDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;
import saas.win.SaaSwin.util.SHA512Util;

import java.util.Optional;

@Service
public class KeycloakGetUserIdService {

    @Value("${keycloak.base-url}")
    String KEYCLOAK_BASE_URL;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${keycloak.admin-user-name}")
    String adminUserName;

    @Value("${keycloak.admin-user-password}")
    String adminUserPassword;

    @Autowired
    private KeycloakAuthService keycloakAuthService;

    @Value("${keycloak.realm}")
    String realm;

    /**
     * Keycloak 사용자 ID(UUID) 조회 - 관리자 권한으로 액세스 토큰 직접 획득
     */
    public String getUserId(String username) {
        // 관리자 액세스 토큰 획득
        KeycloakTokenResponseDto tokenResponse;
        try {
            tokenResponse = keycloakAuthService.getToken(
                    new KeycloakTokenRequestDto(adminUserName, SHA512Util.hashSHA512(adminUserPassword), realm)
            );
        } catch (Exception e) {
            throw new KeycloakException("❌ 관리자 액세스 토큰 발급 실패: " + e.getMessage(), e);
        }

        // 기존 메서드 호출하여 사용자 ID 조회
        return getUserId(username, tokenResponse);
    }

    /**
     * Keycloak 사용자 ID(UUID) 조회
     */
    public String getUserId(String username, KeycloakTokenResponseDto tokenResponse) {
        String adminToken = tokenResponse.getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + adminToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<KeycloakUserIdResponseDto[]> response = restTemplate.exchange(
                    KEYCLOAK_BASE_URL + "/admin/realms/" + realm +"/users?username=" + username,
                    HttpMethod.GET, entity, KeycloakUserIdResponseDto[].class
            );

            KeycloakUserIdResponseDto[] users = response.getBody();
            if (users == null || users.length == 0) {
                throw new KeycloakException("사용자를 찾을 수 없습니다: " + username);
            }

            return Optional.ofNullable(users[0].getId())
                    .orElseThrow(() -> new KeycloakException("사용자 ID(UUID)를 찾을 수 없습니다."));

        } catch (RestClientResponseException e) {
            throw new KeycloakException("Keycloak 사용자 ID 조회 오류: " + e.getResponseBodyAsString(), e);
        }
    }
    
    /**
     * Keycloak 사용자 ID(UUID) 조회 (액세스 토큰 직접 입력)
     * @param username 사용자명
     * @param adminToken 관리자 액세스 토큰
     * @return 사용자 ID
     */
    public String getUserIdWithToken(String username, String adminToken, String realmParam) {
         System.out.println("=== Token Debug ===");
        System.out.println("Admin Token exists: " + (adminToken != null));
        System.out.println("Admin Token length: " + (adminToken != null ? adminToken.length() : 0));
        System.out.println("Token starts with: " + (adminToken != null ? adminToken.substring(0, Math.min(20, adminToken.length())) : "null"));
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + adminToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<KeycloakUserIdResponseDto[]> response = restTemplate.exchange(
                    KEYCLOAK_BASE_URL + "/admin/realms/" + realmParam +"/users?username=" + username,
                    HttpMethod.GET, entity, KeycloakUserIdResponseDto[].class
            );

            KeycloakUserIdResponseDto[] users = response.getBody();
            if (users == null || users.length == 0) {
                throw new KeycloakException("사용자를 찾을 수 없습니다: " + username);
            }

            return Optional.ofNullable(users[0].getId())
                    .orElseThrow(() -> new KeycloakException("사용자 ID(UUID)를 찾을 수 없습니다."));

        } catch (RestClientResponseException e) {
            throw new KeycloakException("Keycloak 사용자 ID 조회 오류: " + e.getResponseBodyAsString(), e);
        }
    }
}
