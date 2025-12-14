package saas.win.SaaSwin.keycloak.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakRefreshTokenRequestDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.security.MessageDigest;

@Service
public class KeycloakAuthService {

    @Value("${keycloak.base-url}")
    private String KEYCLOAK_BASE_URL;
    // private static final String CLIENT_ID = "ehr1";
    private static final String CLIENT_ID = "admin-cli";
    // @Value("${keycloak.ehr1-secret_key}")
    @Value("${keycloak.admin-cli-secret_key}")
    private String CLIENT_SECRET;

    @Value("${keycloak.whnn.admin-cli-secret_key}")
    private String WHNN_CLIENT_SECRET;
    RestTemplate restTemplate = new RestTemplate();
    
    /**
     * Keycloak에서 액세스 토큰을 요청
     */
    public KeycloakTokenResponseDto getToken(KeycloakTokenRequestDto requestDto) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        System.out.println("requestDto = " + requestDto);
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        String clientSecret;
        if ("WHNN".equalsIgnoreCase(requestDto.getRealm())) {
            clientSecret = WHNN_CLIENT_SECRET;
            System.out.println("Using WHNN realm client secret");
        } else if ("master".equalsIgnoreCase(requestDto.getRealm())) {
            clientSecret = CLIENT_SECRET;
            System.out.println("Using master realm client secret");
        } else {
            // 기본값 또는 에러 처리
            throw new KeycloakException("지원하지 않는 realm입니다: " + requestDto.getRealm());
        }
        body.add("client_id", CLIENT_ID);
        body.add("client_secret", clientSecret);
        body.add("username", requestDto.getUsername());
        body.add("password", requestDto.getPassword());
        body.add("grant_type", "password");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
        System.out.println(KEYCLOAK_BASE_URL + "/realms/" + requestDto.getRealm() + "/protocol/openid-connect/token");
        try {
            ResponseEntity<KeycloakTokenResponseDto> response = restTemplate.exchange(
                    KEYCLOAK_BASE_URL + "/realms/" + requestDto.getRealm() + "/protocol/openid-connect/token",
                    HttpMethod.POST, entity, KeycloakTokenResponseDto.class);

            // 200 OK가 아닌 응답 처리
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new KeycloakException("Keycloak 토큰 요청 실패: " + response.getStatusCode());
            }

            KeycloakTokenResponseDto tokenResponse = response.getBody();
            if (tokenResponse == null) {
                throw new KeycloakException("Keycloak 응답이 비어 있습니다.");
            }

            System.out.println("발급된 토큰: " + tokenResponse.getAccessToken());
            System.out.println("리프레시 토근:" + tokenResponse.getRefreshToken());
            System.out.println("=== Token Request Debug ===");
            System.out.println("KEYCLOAK_BASE_URL: " + KEYCLOAK_BASE_URL);
            System.out.println("CLIENT_ID: " + CLIENT_ID);
            System.out.println("CLIENT_SECRET: " + (CLIENT_SECRET != null ? "***설정됨***" : "NULL"));
            System.out.println("Realm: " + requestDto.getRealm());
            System.out.println("Username: " + requestDto.getUsername());
            System.out.println("Password length: " + (requestDto.getPassword() != null ? requestDto.getPassword().length() : "NULL"));
            
            String fullUrl = KEYCLOAK_BASE_URL + "/realms/" + requestDto.getRealm() + "/protocol/openid-connect/token";
            System.out.println("Full URL: " + fullUrl);
            return tokenResponse; // 🔹 DTO 전체 반환

        } catch (RestClientResponseException e) {
            String responseBody = e.getResponseBodyAsString();
            String errorMessage = "Keycloak 인증 실패";
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(responseBody);
                String error = root.path("error").asText(null);
                String description = root.path("error_description").asText(null);
                if (error != null) {
                    if ("invalid_grant".equals(error)) {
                        errorMessage = "아이디 또는 비밀번호가 일치하지 않습니다.";
                    } else if ("invalid_client".equals(error)) {
                        errorMessage = "클라이언트 인증 실패: 잘못된 클라이언트 정보입니다.";
                    } else if (description != null) {
                        errorMessage = description;
                    }
                }
            } catch (Exception parseEx) {
                // JSON 파싱 실패 시 원본 응답 포함
                errorMessage += ": " + responseBody;
            }
            throw new KeycloakException(errorMessage, e);
        }
    }

}
