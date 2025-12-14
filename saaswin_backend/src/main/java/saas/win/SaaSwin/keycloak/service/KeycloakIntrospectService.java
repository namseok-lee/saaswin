package saas.win.SaaSwin.keycloak.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.keycloak.dto.KeycloakIntrospectRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakIntrospectResponseDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
public class  KeycloakIntrospectService {


    @Value("${keycloak.base-url}")
    private String KEYCLOAK_BASE_URL;
    private static final String CLIENT_ID = "ehr1";
    // @Value("${keycloak.ehr1-secret_key}")
    @Value("${keycloak.admin-cli-secret_key}")
    private String CLIENT_SECRET;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Keycloak 토큰 유효성 검사(Introspection)
     */
    public KeycloakIntrospectResponseDto introspectToken(KeycloakIntrospectRequestDto request) {
        System.out.println("introspectToken 접속");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("token", request.getToken());
        body.add("client_id", CLIENT_ID);
        body.add("client_secret", CLIENT_SECRET);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
        System.out.println("Realm : " + request.getRealm());
        try {
            ResponseEntity<KeycloakIntrospectResponseDto> response = restTemplate.exchange(
                    KEYCLOAK_BASE_URL + "/realms/" + request.getRealm() + "/protocol/openid-connect/token/introspect", HttpMethod.POST, entity, KeycloakIntrospectResponseDto.class
            );


            System.out.println("response : " + response.getBody());

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new KeycloakException("Keycloak 토큰 검증 실패: " + response.getStatusCode());
            }

            return response.getBody();

        } catch (RestClientResponseException e) {
            throw new KeycloakException("Keycloak 요청 중 오류 발생: " + e.getResponseBodyAsString(), e);
        }
    }
}
