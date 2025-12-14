package saas.win.SaaSwin.keycloak.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.keycloak.dto.KeycloakUpdatePasswordRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import saas.win.SaaSwin.util.SHA512Util;
@Service
public class KeycloakPasswordService {

    @Value("${keycloak.base-url}")
    private String KEYCLOAK_BASE_URL;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${keycloak.admin-user-name}")
    String adminUserName;

    @Value("${keycloak.admin-user-password}")
    String adminUserPassword;

    @Autowired
    private KeycloakAuthService keycloakAuthService;
    @Autowired
    private KeycloakGetUserIdService keycloakGetUserIdService;

    /**
     * Keycloak 사용자 비밀번호 변경
     */
    public ResponseEntity<String> updatePassword( KeycloakUpdatePasswordRequestDto request) {

        // KeycloakAuthService에서 토큰 가져오기
        KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(
                new KeycloakTokenRequestDto(adminUserName, SHA512Util.hashSHA512(adminUserPassword), "WIN")
        );

        String userId = keycloakGetUserIdService.getUserId(request.getUsername(), tokenResponse);

        String adminToken = tokenResponse.getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + adminToken);
        System.out.println("request.getCredentials() : " + request.getCredentials());
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("credentials", request.getCredentials());
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            return restTemplate.exchange(
                    KEYCLOAK_BASE_URL + "/admin/realms/" + request.getRealm() + "/users/" + userId,
                    HttpMethod.PUT, entity, String.class
            );
        } catch (RestClientResponseException e) {
            throw new KeycloakException("Keycloak 비밀번호 변경 오류: " + e.getResponseBodyAsString(), e);
        }
    }
}
