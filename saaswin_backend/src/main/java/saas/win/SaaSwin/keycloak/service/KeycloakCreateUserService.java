package saas.win.SaaSwin.keycloak.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.keycloak.dto.KeycloakUserRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;

import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import saas.win.SaaSwin.util.SHA512Util;
@Service
public class KeycloakCreateUserService {

    @Value("${keycloak.base-url}")
    private String KEYCLOAK_BASE_URL;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${keycloak.admin-user-name}")
    String adminUserName;

    @Value("${keycloak.admin-user-password}")
    String adminUserPassword;

    @Autowired
    private KeycloakAuthService keycloakAuthService;


    /**
     * Keycloak 사용자 생성
     */
    public ResponseEntity<String> registerUser(KeycloakUserRequestDto request) {
        System.out.println("가입 시작");
        String realm = request.getRealm();

        // 2. KeycloakAuthService에서 토큰 가져오기
        KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(
                new KeycloakTokenRequestDto("admin", "admin", "master")
        );
        String adminToken = tokenResponse.getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + adminToken);

        // Keycloak API URL 설정
        String keycloakUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + request.getRealm() + "/users";

        // 요청 데이터 구성
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("username", request.getUsername());
        requestBody.put("enabled", true);
        requestBody.put("credentials", request.getCredentials());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            return restTemplate.exchange(
                    keycloakUrl, HttpMethod.POST, entity, String.class
            );
        } catch (RestClientResponseException e) {
            throw new KeycloakException("Keycloak 사용자 생성 오류: " + e.getResponseBodyAsString(), e);
        }
    }
//    /**
//     * Realm 존재 여부 확인 및 생성
//     */
//    private void ensureRealmExists(String realm) {
//        try {
//            // Master realm의 admin 토큰 가져오기 (realm 관리용)
//            KeycloakTokenResponseDto masterTokenResponse = keycloakAuthService.getToken(
//                    new KeycloakTokenRequestDto(adminUserName, SHA512Util.hashSHA512(adminUserPassword), "master")
//            );
//            String masterAdminToken = masterTokenResponse.getAccessToken();
//
//            // Realm 존재 여부 확인
//            if (!realmExists(realm, masterAdminToken)) {
//                createRealm(realm, masterAdminToken);
//            }
//
//        } catch (Exception e) {
//            throw new KeycloakException("Realm 확인/생성 오류: " + e.getMessage(), e);
//        }
//    }

//    /**
//     * Realm 존재 여부 확인
//     */
//    private boolean realmExists(String realm, String adminToken) {
//        try {
//            HttpHeaders headers = new HttpHeaders();
//            headers.set("Authorization", "Bearer " + adminToken);
//
//            String realmCheckUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm;
//            HttpEntity<String> entity = new HttpEntity<>(headers);
//
//            restTemplate.exchange(realmCheckUrl, HttpMethod.GET, entity, String.class);
//            return true; // 200 OK면 존재함
//
//        } catch (RestClientResponseException e) {
//            if (e.getStatusCode().value() == 404) {
//                return false; // 404면 존재하지 않음
//            }
//            throw new KeycloakException("Realm 확인 오류: " + e.getResponseBodyAsString(), e);
//        }
//    }
//
//    /**
//     * Realm 생성
//     */
//    private void createRealm(String realm, String adminToken) {
//        try {
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_JSON);
//            headers.set("Authorization", "Bearer " + adminToken);
//
//            String createRealmUrl = KEYCLOAK_BASE_URL + "/admin/realms";
//
//            // Realm 생성 요청 데이터
//            Map<String, Object> realmData = new HashMap<>();
//            realmData.put("realm", realm);
//            realmData.put("enabled", true);
//            realmData.put("displayName", realm);
//
//            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(realmData, headers);
//
//            ResponseEntity<String> response = restTemplate.exchange(
//                    createRealmUrl, HttpMethod.POST, entity, String.class
//            );
//
//            if (response.getStatusCode().is2xxSuccessful()) {
//                System.out.println("Realm 생성 성공: " + realm);
//            } else {
//                throw new KeycloakException("Realm 생성 실패: " + response.getBody());
//            }
//
//        } catch (RestClientResponseException e) {
//            throw new KeycloakException("Realm 생성 오류: " + e.getResponseBodyAsString(), e);
//        }
//    }

    public ResponseEntity<String> bulkRegisterUsers(String realm, List<KeycloakUserRequestDto> users) {
        System.out.println("Keycloak bulk 등록 시작: 사용자 수 = " + users.size());

        // 1. Keycloak admin 토큰 가져오기
        KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(
            new KeycloakTokenRequestDto("admin", "admin", "master")
        );
        String adminToken = tokenResponse.getAccessToken();

        // 2. 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + adminToken);

        // 3. 요청 URL 구성
        String keycloakUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm + "/partialImport";
        List<Map<String, Object>> userMaps = new ArrayList<>();
        for (KeycloakUserRequestDto dto : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("username", dto.getUsername());
            userMap.put("enabled", true);
            userMap.put("emailVerified", true);
            userMap.put("email", dto.getEmail()); // 이메일을 username과 동일하게 쓰는 경우
            userMap.put("credentials", dto.getCredentials()); // 자동 생성된 credentials
            userMaps.add(userMap);
        }
        // 4. partialImport body 구성
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("ifResourceExists", "SKIP");  // 또는 "OVERWRITE", "FAIL" 필요 시 선택
        requestBody.put("users", userMaps); // 각 사용자는 Map<String, Object> 형태로 구성

        // 5. 요청 전송
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        try {
            return restTemplate.exchange(keycloakUrl, HttpMethod.POST, entity, String.class);
        } catch (RestClientResponseException e) {
            throw new KeycloakException("Keycloak bulk 사용자 생성 오류: " + e.getResponseBodyAsString(), e);
        }
    }
    public ResponseEntity<String> bulkUpdateUsers(String realm, List<KeycloakUserRequestDto> users) {
        System.out.println("Keycloak 사용자 수정 시작: 사용자 수 = " + users.size());
    
        // 1. 관리자 토큰 발급
        KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(
            new KeycloakTokenRequestDto("admin", "admin", "master")
        );
        String adminToken = tokenResponse.getAccessToken();
    
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + adminToken);
    
        for (KeycloakUserRequestDto dto : users) {
            try {
                // 2. username으로 userId 조회
                String searchUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm + "/users?username=" + dto.getUsername();
                ResponseEntity<List> searchResponse = restTemplate.exchange(
                    searchUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class
                );
    
                if (searchResponse.getBody() == null || searchResponse.getBody().isEmpty()) {
                    System.out.println("사용자 찾을 수 없음: " + dto.getUsername());
                    continue;
                }
    
                Map user = (Map) searchResponse.getBody().get(0);
                String userId = (String) user.get("id");
    
                // 3. 업데이트 정보 구성
                Map<String, Object> updateBody = new HashMap<>();
                updateBody.put("email", dto.getEmail());
                updateBody.put("emailVerified", true);
                updateBody.put("enabled", true);
                updateBody.put("username", dto.getUsername());
    
                if (dto.getCredentials() != null) {
                    updateBody.put("credentials", dto.getCredentials());
                }
    
                // 4. 사용자 정보 업데이트
                String updateUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm + "/users/" + userId;
                HttpEntity<Map<String, Object>> updateEntity = new HttpEntity<>(updateBody, headers);
    
                restTemplate.exchange(updateUrl, HttpMethod.PUT, updateEntity, Void.class);
            } catch (Exception e) {
                throw new KeycloakException("Keycloak 사용자 수정 실패 (" + dto.getUsername() + "): " + e.getMessage(), e);
            }
        }
    
        return ResponseEntity.ok("사용자 수정 완료");
    }
    public ResponseEntity<String> bulkDisableUsers(String realm, List<String> usernames) {
        System.out.println("Keycloak 사용자 벌크 비활성화 시작: 총 " + usernames.size() + "명");
    
        // 1. 관리자 토큰 발급
        KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(
            new KeycloakTokenRequestDto("admin", "admin", "master")
        );
        String adminToken = tokenResponse.getAccessToken();
    
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);
    
        List<String> failedUsers = new ArrayList<>();
    
        for (String username : usernames) {
            try {
                // 2. username → userId 조회
                String searchUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm + "/users?username=" + username;
                ResponseEntity<List> searchResponse = restTemplate.exchange(
                    searchUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class
                );
    
                List<?> users = searchResponse.getBody();
                if (users == null || users.isEmpty()) {
                    System.err.println("❌ 사용자 찾을 수 없음: " + username);
                    failedUsers.add(username);
                    continue;
                }
    
                Map<?, ?> user = (Map<?, ?>) users.get(0);
                String userId = (String) user.get("id");
                if (userId == null || userId.isEmpty()) {
                    System.err.println("❌ userId가 없음: " + username);
                    failedUsers.add(username);
                    continue;
                }
    
                // 3. 비활성화 처리
                String updateUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm + "/users/" + userId;
                Map<String, Object> updateBody = new HashMap<>();
                updateBody.put("enabled", false);
    
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(updateBody, headers);
                restTemplate.exchange(updateUrl, HttpMethod.PUT, entity, Void.class);
    
                System.out.println("✅ 비활성화 완료: " + username);
    
            } catch (RestClientResponseException e) {
                System.err.println("❌ Keycloak API 오류 (" + username + "): " + e.getResponseBodyAsString());
                failedUsers.add(username);
            } catch (Exception e) {
                System.err.println("❌ 처리 중 예외 발생 (" + username + "): " + e.getMessage());
                failedUsers.add(username);
            }
        }
    
        if (failedUsers.isEmpty()) {
            return ResponseEntity.ok("✅ 모든 사용자 비활성화 완료");
        } else {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS)
                .body("⚠ 일부 사용자 비활성화 실패: " + String.join(", ", failedUsers));
        }
    }
    
    
    public ResponseEntity<String> bulkEnableUsers(String realm, List<String> usernames) {
        System.out.println("Keycloak 사용자 벌크 재활성화 시작: 총 " + usernames.size() + "명");
    
        // 1. 관리자 토큰 발급
        KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(
            new KeycloakTokenRequestDto("admin", "admin", "master")
        );
        String adminToken = tokenResponse.getAccessToken();
    
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);
    
        List<String> failedUsers = new ArrayList<>();
    
        for (String username : usernames) {
            try {
                // 2. username → userId 조회
                String searchUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm + "/users?username=" + username;
                ResponseEntity<List> searchResponse = restTemplate.exchange(
                    searchUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class
                );
    
                List<?> users = searchResponse.getBody();
                if (users == null || users.isEmpty()) {
                    System.err.println("❌ 사용자 찾을 수 없음: " + username);
                    failedUsers.add(username);
                    continue;
                }
    
                Map<?, ?> user = (Map<?, ?>) users.get(0);
                String userId = (String) user.get("id");
                if (userId == null || userId.isEmpty()) {
                    System.err.println("❌ userId가 없음: " + username);
                    failedUsers.add(username);
                    continue;
                }
    
                // 3. 재활성화 처리
                String updateUrl = KEYCLOAK_BASE_URL + "/admin/realms/" + realm + "/users/" + userId;
                Map<String, Object> updateBody = new HashMap<>();
                updateBody.put("enabled", true); // ✅ 재활성화
    
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(updateBody, headers);
                restTemplate.exchange(updateUrl, HttpMethod.PUT, entity, Void.class);
    
                System.out.println("✅ 재활성화 완료: " + username);
    
            } catch (RestClientResponseException e) {
                System.err.println("❌ Keycloak API 오류 (" + username + "): " + e.getResponseBodyAsString());
                failedUsers.add(username);
            } catch (Exception e) {
                System.err.println("❌ 처리 중 예외 발생 (" + username + "): " + e.getMessage());
                failedUsers.add(username);
            }
        }
    
        if (failedUsers.isEmpty()) {
            return ResponseEntity.ok("✅ 모든 사용자 재활성화 완료");
        } else {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS)
                .body("⚠ 일부 사용자 재활성화 실패: " + String.join(", ", failedUsers));
        }
    }
    
}

