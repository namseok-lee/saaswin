package saas.win.SaaSwin.keycloak.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.keycloak.dto.KeycloakRefreshTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakRefreshTokenResponseDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;

@Service
public class KeycloakRefreshTokenService {

    @Value("${keycloak.base-url}/realms/Win-SSO/protocol/openid-connect/token")
    private String KEYCLOAK_TOKEN_URL;
    private static final String CLIENT_ID = "ehr1";
    // @Value("${keycloak.ehr1-secret_key}")
    @Value("${keycloak.admin-cli-secret_key}")
    private String CLIENT_SECRET;

    RestTemplate restTemplate = new RestTemplate();



    /**
     * 기존 리프레시 토큰을 사용하여 새 액세스 토큰 요청
     */
    public KeycloakRefreshTokenResponseDto refreshToken(KeycloakRefreshTokenRequestDto requestDto) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", CLIENT_ID);
        body.add("client_secret", CLIENT_SECRET);
        body.add("grant_type", "refresh_token");
        body.add("refresh_token", requestDto.getRefreshToken());

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<KeycloakRefreshTokenResponseDto> response = restTemplate.exchange(
                    KEYCLOAK_TOKEN_URL, HttpMethod.POST, entity, KeycloakRefreshTokenResponseDto.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new KeycloakException("Keycloak 토큰 갱신 실패: " + response.getStatusCode());
            }

            return response.getBody();

        } catch (RestClientResponseException e) {
            throw new KeycloakException("Keycloak 리프레시 토큰 요청 오류 발생: " + e.getResponseBodyAsString(), e);
        }
    }
}
