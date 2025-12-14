package saas.win.SaaSwin.keycloak.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;
import saas.win.SaaSwin.util.SHA512Util;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.aligo.dto.AligoRequestDTO;
import saas.win.SaaSwin.aligo.service.AligoService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import com.google.gson.Gson;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class KeycloakSessionService {

    @Value("${keycloak.base-url}")
    private String keycloakBaseUrl;

    @Value("${keycloak.admin-user-name}")
    private String adminUserName;

    @Value("${keycloak.admin-user-password}")
    private String adminUserPassword;

    @Value("${keycloak.realm}")
    private String realmName;

    // @Value("${keycloak.ehr1-secret_key}")
    @Value("${keycloak.admin-cli-secret_key}")
    private String clientSecret;

    @Autowired
    private KeycloakAuthService keycloakAuthService;

    @Autowired
    private KeycloakGetUserIdService keycloakGetUserIdService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private AligoService aligoService;

    @Autowired
    private SqlService sqlService;

    private final RestTemplate restTemplate = new RestTemplate();
    
    // 관리자 토큰 캐싱을 위한 필드
    private String cachedAdminToken;
    private String cachedRefreshToken;
    private long tokenExpirationTime;
    private static final long TOKEN_EXPIRATION_BUFFER = 60; // 토큰 만료 1분 전에 갱신
    
    /**
     * 캐시된 관리자 토큰이 유효한지 확인
     * @return 유효한 경우 true, 아니면 false
     */
    private boolean isAdminTokenValid() {
        return cachedAdminToken != null && Instant.now().getEpochSecond() < (tokenExpirationTime - TOKEN_EXPIRATION_BUFFER);
    }
    
    /**
     * 관리자 액세스 토큰 획득 (캐싱 로직 추가)
     * @return 관리자 액세스 토큰
     */
    private String getAdminToken() {
        System.out.println("Admin 토큰 요청 시작");
        
        // 캐시된 토큰이 유효한 경우 재사용
        if (isAdminTokenValid()) {
            System.out.println("✅ 캐시된 Admin 토큰이 유효합니다. 캐시된 토큰을 재사용합니다.");
            return cachedAdminToken;
        }
        
        // 캐시된 토큰이 없거나 만료된 경우, 리프레시 토큰이 있으면 리프레시 시도
        if (cachedRefreshToken != null) {
            try {
                System.out.println("🔄 Admin 토큰 리프레시 시도");
                // 여기에 리프레시 토큰 로직 추가 (현재는 직접 새로 로그인하는 방식으로 구현)
            } catch (Exception e) {
                System.out.println("❌ Admin 토큰 리프레시 실패, 새로 로그인합니다: " + e.getMessage());
            }
        }
        
        // 새 토큰 발급
        try {
            System.out.println("🔑 Admin 새 토큰 발급 시도");
            KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(
                    new KeycloakTokenRequestDto(adminUserName, adminUserPassword, realmName)
            );
            
            // 토큰 캐싱
            cachedAdminToken = tokenResponse.getAccessToken();
            cachedRefreshToken = tokenResponse.getRefreshToken();
            
            // 만료 시간 설정 - 토큰의 exp 클레임 값을 사용하는 것이 이상적이지만,
            // 여기서는 토큰 발급 시간 + access_token_lifespan으로 계산 (기본값은 보통 5분)
            tokenExpirationTime = Instant.now().getEpochSecond() + tokenResponse.getExpiresIn();
            
            System.out.println("✅ Admin 새 토큰 발급 성공. 만료 시간: " + 
                    Instant.ofEpochSecond(tokenExpirationTime).toString());
            
            return cachedAdminToken;
        } catch (Exception e) {
            System.out.println("❌ Admin access token 발급 실패: " + e.getMessage());
            throw new KeycloakException("❌ 관리자 액세스 토큰 발급 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 특정 사용자의 세션 정보 확인
     * @param username 사용자명
     * @return 세션 정보가 있으면 세션 데이터, 없으면 null
     */
    public ResponseEntity<Map<String, Object>> checkUserSessions(String username, String realmParam, String user_id) {
        System.out.println("User session 확인 시작: " + username);
        
        // 관리자 액세스 토큰 획득 (캐싱된 토큰 사용)
        String adminToken = getAdminToken();

        // 특정 사용자 ID 조회
        String userId;
        try {
            userId = keycloakGetUserIdService.getUserIdWithToken(username, adminToken, realmParam);
         } catch (Exception e) {
            // 사용자가 없는 경우 null 반환
            System.out.println("❌ User ID 조회 실패 (No user): " + username);
            return null;
        }

        // Keycloak 사용자 세션 조회 API 호출 - 사용자 세션 목록 확인
        String sessionUrl = keycloakBaseUrl + "/admin/realms/" + realmParam + "/users/" + userId + "/sessions";
        System.out.println("Session 조회 URL: " + sessionUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            // 세션 목록 조회 (배열로 반환됨)
            ResponseEntity<Object[]> response = restTemplate.exchange(sessionUrl, HttpMethod.GET, request, Object[].class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Object[] sessions = response.getBody();
                
                // 세션이 있는지 확인 (배열의 길이로 판단)
                if (sessions != null && sessions.length > 0) {
                    // 세션이 존재하는 경우
                    System.out.println("✅ User(" + username + ")의 active session이 있습니다. 세션 수: " + sessions.length);
                    
                    // 추가로 사용자 정보도 가져오기
                    String userUrl = keycloakBaseUrl + "/admin/realms/" + realmParam + "/users/" + userId;
                    ResponseEntity<Map> userResponse = restTemplate.exchange(userUrl, HttpMethod.GET, request, Map.class);
                    Map<String, Object> userData = userResponse.getBody();
                    
                    // --- 사용자 ID(username)로 tsm_user의 user_no 조회 --- 
                    String userNo = null;
                    try {
                        log.info("사용자 ID '{}'로 user_no 조회를 시도합니다. (sqlId: hrs_login01, sql_key: hrs_login, login_type: generic)", username); // 로그 메시지 수정
                        SswRequestSqlDTO userSqlDto = new SswRequestSqlDTO();
                        userSqlDto.setSqlId(SqlConstants.REDIS_SQL_LOGIN_01); // "hrs_login01"
                        userSqlDto.setSql_key("hrs_login"); // "hrs_login" 키 사용

                        Map<String, Object> userQueryParam = new HashMap<>();
                        userQueryParam.put("user_id", user_id); // Keycloak username을 user_id로 전달
                        userQueryParam.put("login_type", "generic"); // login_type 설정
                        // pswd는 전달하지 않음
                        userSqlDto.setParams(Collections.singletonList(userQueryParam));

                        log.debug("Executing user_no lookup with parameters: {}", new Gson().toJson(userSqlDto));
                        List<Map<String, Object>> userInfoResult = sqlService.executeQuery_select_for_func(userSqlDto);
                        log.debug("Raw result from user_no lookup: {}", new Gson().toJson(userInfoResult));

                        // --- 결과 파싱 --- 
                        // !!! 중요: saaswin_login 함수의 실제 반환 구조에 따라 아래 파싱 로직 수정 필요 !!!
                        if (userInfoResult != null && !userInfoResult.isEmpty()) {
                             // 예시: 결과가 이중 "data" 키 구조라고 가정 (실제 확인 필요)
                             Map<String, Object> dataMap = (Map<String, Object>) userInfoResult.get(0).get("data");
                             if (dataMap != null && dataMap.containsKey("data")) {
                                 // 반환 코드가 성공(40002)인지 먼저 확인하는 것이 좋을 수 있음
                                 // if ("40002".equals(dataMap.get("return_cd"))) { ... }
                                 Object innerData = dataMap.get("data");
                                 // innerData가 List<Map> 형태일 수도 있고, 단일 Map일 수도 있음 -> 확인 필요
                                 if (innerData instanceof List) { 
                                     List<Map<String, Object>> innerDataList = (List<Map<String, Object>>) innerData;
                                     if (!innerDataList.isEmpty()) {
                                         Map<String, Object> outerDataMap = innerDataList.get(0); // 이름 변경 및 로직 수정 시작
                                         if (outerDataMap.containsKey("data") && outerDataMap.get("data") instanceof Map) {
                                             Map<String, Object> actualUserData = (Map<String, Object>) outerDataMap.get("data"); // 내부 "data" 맵 가져오기
                                             if (actualUserData.containsKey("user_no")) { // 내부 맵에서 "user_no" 확인
                                                  userNo = String.valueOf(actualUserData.get("user_no"));
                                                  log.info("사용자 ID '{}'에 해당하는 user_no '{}'를 찾았습니다.", username, userNo);
                                             } else {
                                                  log.warn("조회된 실제 사용자 데이터 맵에 'user_no' 키가 없습니다. Actual User Data: {}", new Gson().toJson(actualUserData));
                                             }
                                         } else {
                                             log.warn("조회된 데이터 구조가 예상과 다릅니다 (내부 'data' 키 부재 또는 타입 오류). Outer Data Map: {}", new Gson().toJson(outerDataMap));
                                         }
                                     } else {
                                        log.warn("Inner data list is empty. DataMap: {}", new Gson().toJson(dataMap));
                                     }
                                 } else if (innerData instanceof Map) { // 단일 Map 형태일 경우 (가정)
                                     Map<String, Object> userDataFromDb = (Map<String, Object>) innerData;
                                     if (userDataFromDb.containsKey("user_no")) {
                                          userNo = String.valueOf(userDataFromDb.get("user_no"));
                                          log.info("사용자 ID '{}'에 해당하는 user_no '{}'를 찾았습니다. (Single Map)", username, userNo);
                                     } else {
                                          log.warn("조회된 사용자 데이터(Single Map)에 'user_no' 키가 없습니다. Data: {}", new Gson().toJson(userDataFromDb));
                                     }
                                 } else {
                                     log.warn("Inner data is neither List nor Map. Type: {}", innerData != null ? innerData.getClass().getName() : "null");
                                 }
                             } else {
                                 log.warn("Result map does not contain 'data' key or it's null, or return_cd indicates failure. Result: {}", new Gson().toJson(userInfoResult.get(0)));
                             }
                         } else {
                            log.warn("User info lookup returned null or empty list.");
                         }
                         // --- 파싱 끝 ---

                        if (userNo == null) {
                            log.warn("사용자 ID '{}'에 해당하는 user_no를 찾을 수 없거나 파싱에 실패했습니다. (hrs_login 사용)", username);
                        }

                    } catch (Exception e) {
                        log.error("user_no 조회 중 오류 발생 (hrs_login 사용). 사용자 ID: {}. Exception: {}", username, e.getMessage(), e);
                        userNo = null;
                    }
                    // --- user_no 조회 끝 ---

                    // --- 기존 인증 코드 생성 및 저장 로직 (유지) ---
                    String authCode = String.format("%06d", (int)(Math.random() * 1000000));
                    redisTemplate.opsForValue().set("keycloak_auth_" + username, authCode, Duration.ofMinutes(5));
                    System.out.println("✅ User(" + username + ")를 위한 인증 코드가 Redis에 저장되었습니다: " + authCode);
                    // --- 기존 인증 코드 생성 및 저장 로직 끝 ---

                    // --- 알리고 알림톡 전송 로직 (userNo가 있을 경우에만 실행) ---
                    if (userNo != null) { 
                        try {
                            log.info("기존 세션 감지, 사용자 (user_no: '{}')에게 알림톡(TZ_4244) 전송 시도.", userNo);
                            AligoRequestDTO aligoRequest = new AligoRequestDTO();
                            aligoRequest.setNt_tmplt("TZ_4244");

                            List<Map<String, String>> params = new ArrayList<>();
                            Map<String, String> userParam = new HashMap<>();
                            userParam.put("user_no", userNo); // 조회된 user_no 사용
                            userParam.put("user_id", user_id); // 생성된 인증 코드 추가
                            userParam.put("cert_no", authCode); // 생성된 인증 코드 추가
                            params.add(userParam);
                            aligoRequest.setParams(params);

                            List<AligoRequestDTO> aligoRequestList = new ArrayList<>();
                            aligoRequestList.add(aligoRequest);

                            // 생년월일 조회
                            SswRequestSqlDTO brdtSqlDto = new SswRequestSqlDTO();
                            String brdtSqlId = SqlConstants.REDIS_SQL_APNT_01;
                            String brdtSql_key = SqlConstants.REDIS_SQL_APNT_KEY_01;
                            brdtSqlDto.setSqlId(brdtSqlId);
                            brdtSqlDto.setSql_key(brdtSql_key);
                            Map<String, Object> brdtParamMap = new HashMap<>();
                            brdtParamMap.put("user_no", userNo);
                            brdtParamMap.put("target", "tom_bsc.bsc_info");
                            brdtParamMap.put("key_col_nm", "user_no");

                            List<Map<String, Object>> brdtParams = new ArrayList<>();
                            brdtParams.add(brdtParamMap);
                            brdtSqlDto.setParams(brdtParams);
                            List<Map<String, Object>> brdtResult = sqlService.executeQuery_select_for_func(brdtSqlDto);

                            List<Map<String, Object>> level1Data = (List<Map<String, Object>>) ((Map<String, Object>) brdtResult.get(0).get("data")).get("data");
                            Map<String, Object> saaswinMap = (Map<String, Object>) level1Data.get(0).get("saaswin_hpo_array_info_get");
                            List<Map<String, Object>> level2Data = (List<Map<String, Object>>) saaswinMap.get("data");

                            Map<String, Object> seqBrdtMap = level2Data.get(0);
                            String brdt = (String) seqBrdtMap.get("brdt");

                            // 전화번호 조회
                            SswRequestSqlDTO telnoSqlDto = new SswRequestSqlDTO();
                            String telnoSqlId = SqlConstants.REDIS_SQL_APNT_01;
                            String telnoSql_key = SqlConstants.REDIS_SQL_APNT_KEY_01;
                            telnoSqlDto.setSqlId(telnoSqlId);
                            telnoSqlDto.setSql_key(telnoSql_key);
                            Map<String, Object> telnoParamMap = new HashMap<>();
                            telnoParamMap.put("user_no", userNo);
                            telnoParamMap.put("target", "tom_bsc.telno_info");
                            telnoParamMap.put("key_col_nm", "user_no");
                            List<Map<String, Object>> telnoParams = new ArrayList<>();
                            telnoParams.add(telnoParamMap);
                            telnoSqlDto.setParams(telnoParams);
                            List<Map<String, Object>> telnoResult = sqlService.executeQuery_select_for_func(telnoSqlDto);


                            List<Map<String, Object>> level1telnoData = (List<Map<String, Object>>) ((Map<String, Object>) telnoResult.get(0).get("data")).get("data");
                            Map<String, Object> saaswintelnoMap = (Map<String, Object>) level1telnoData.get(0).get("saaswin_hpo_array_info_get");
                            List<Map<String, Object>> level2telnoData = (List<Map<String, Object>>) saaswintelnoMap.get("data");

                            Map<String, Object> seqTelnoMap = level2telnoData.get(0);
                            String telno = (String) seqTelnoMap.get("telno");

                            // 알림톡 발송
                            SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
                            String sqlId = SqlConstants.REDIS_SQL_LOGIN_01;
                            String sql_key = SqlConstants.REDIS_SQL_ALG_KEY_06;
                            sqlDto.setSqlId(sqlId);
                            sqlDto.setSql_key(sql_key);
                            Map<String, Object> paramMap = new HashMap<>();

                            paramMap.put("user_id", user_id);
                            paramMap.put("pblcn_type", "nt");
                            paramMap.put("brdt", brdt);
                            paramMap.put("telno", telno);

                            List<Map<String, Object>> params2 = new ArrayList<>();
                            params2.add(paramMap);
                            sqlDto.setParams(params2);
                            List<Map<String, Object>> result = sqlService.executeQuery_select_for_func(sqlDto);
                            Map<String, Object> resMap = (Map)result.get(0).get("data");

                            // SswResponseDTO aligoResponse = aligoService.sendAligoTalk(aligoRequestList);

                            // if (aligoResponse != null && SswConstants.RESULT_CODE_SUCCESS.equals(aligoResponse.getRtnCode())) {
                            //     log.info("사용자 (user_no: '{}')에게 알림톡(TZ_4244) 전송 성공.", userNo);
                            // } else {
                            //     log.warn("사용자 (user_no: '{}')에게 알림톡(TZ_4244) 전송 실패. 응답: {}", userNo, aligoResponse);
                            // }
                        } catch (Exception e) {
                            log.error("사용자 (user_no: '{}')에게 알림톡(TZ_4244) 전송 중 오류 발생", userNo, e);
                        }
                    } else {
                         log.warn("user_no를 찾지 못했거나 조회 중 오류가 발생하여 알림톡 전송을 건너뜁니다. (사용자 ID: {})", username);
                    }
                    // --- 알리고 알림톡 전송 로직 끝 ---

                    Map<String, Object> responseBody = new HashMap<>();
                    responseBody.put("resData", userData);
                    responseBody.put("rtnCode", "S000");
                    responseBody.put("rtnMsg", "User가 이미 로그인되어 있습니다. 추가 인증이 필요합니다.");
                    responseBody.put("sessionStatus", "ACTIVE");
                    responseBody.put("sessionMessage", "Active session exists");
                    responseBody.put("sessionCount", sessions.length);
                    responseBody.put("sessions", sessions);
                    responseBody.put("authCode", authCode); // 난수를 응답에 포함
                    
                    // 헤더 설정
                    HttpHeaders responseHeaders = new HttpHeaders();
                    // 이미 로그인된 사용자이므로 토큰을 제공할 필요가 없음
                    
                    return ResponseEntity.ok()
                            .headers(responseHeaders)
                            .body(responseBody);
                } else {
                    System.out.println("✅ User(" + username + ")의 active session이 없습니다. 일반 로그인 진행.");
                    // 세션이 없으면 기존 로직대로 null 또는 다른 응답 반환 (기존 코드 유지)
                     return null; // 또는 기존 로직에 따른 응답
                }
            } else {
                System.out.println("❌ Session 조회 실패: " + response.getStatusCode());
                throw new KeycloakException("Keycloak 세션 조회 실패: " + response.getStatusCode());
            }
        } catch (RestClientResponseException e) {
            System.out.println("❌ Session 조회 오류: " + e.getResponseBodyAsString());
            throw new KeycloakException("Keycloak 세션 조회 오류: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            System.out.println("❌ 예상치 못한 오류 발생: " + e.getMessage());
            throw new KeycloakException("Keycloak 세션 확인 중 예상치 못한 오류 발생", e);
        }
    }

    /**
     * 특정 사용자의 기존 로그인 세션을 강제 종료
     */
    public ResponseEntity<String> logoutUserSessions(String username, String realmParam) {
        System.out.println("User(" + username + ") session logout 시도");
        
        // 관리자 액세스 토큰 획득 (캐싱된 토큰 사용)
        String adminToken = getAdminToken();

        // 특정 사용자 ID 조회
        String userId;
        try {
            userId = keycloakGetUserIdService.getUserIdWithToken(username, adminToken, realmParam);
            System.out.println("User ID 조회 성공: " + username + " -> " + userId);
        } catch (Exception e) {
            System.out.println("❌ User ID 조회 실패: " + e.getMessage());
            throw new KeycloakException("❌ 사용자 ID 조회 실패: " + e.getMessage(), e);
        }

        // Keycloak 로그아웃 API 호출 (POST 방식)
        String logoutUrl = keycloakBaseUrl + "/admin/realms/" + realmParam + "/users/" + userId + "/logout";
        System.out.println("Logout URL: " + logoutUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>("{}",headers);
        System.out.println("=== Logout Request Debug ===");
        System.out.println("URL: " + logoutUrl);
        System.out.println("Headers: " + headers);
        System.out.println("Body: {}");
        try {
            ResponseEntity<String> response = restTemplate.exchange(logoutUrl, HttpMethod.POST, request, String.class);

            if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                System.out.println("✅ User(" + username + ")의 session이 성공적으로 logout되었습니다.");
                return ResponseEntity.ok("✅ User(" + username + ")의 session이 성공적으로 logout되었습니다.");
            } else {
                System.out.println("❌ User session 종료 실패: " + response.getStatusCode());
                throw new KeycloakException("❌ 사용자 세션 종료 실패: " + response.getStatusCode());
            }

        } catch (RestClientResponseException e) {
            System.out.println("❌ User session 종료 요청 오류 발생: " + e.getResponseBodyAsString());          
            
            throw new KeycloakException("❌ 사용자 세션 종료 요청 오류 발생: " + e.getResponseBodyAsString(), e);
        }
    }

    /**
     * 인증된 사용자를 위한 토큰 발급 (인증 코드 검증 후 호출됨)
     * @param username 사용자명
     * @param password 사용자 비밀번호
     * @return 토큰 정보가 포함된 응답
     */
    public ResponseEntity<Map<String, Object>> getTokenForVerifiedUser(String username, String password,String realmParam) {
        System.out.println("인증된 사용자(" + username + ")를 위한 토큰 발급 시작");
        try {
            // 토큰 발급을 위해 KeycloakAuthService의 getToken 메서드 호출 준비
            
            // 관리자 액세스 토큰 획득 (캐싱된 토큰 사용)
            String adminToken = getAdminToken();
            
            // Keycloak에서 사용자 정보 조회 (토큰 발급에 필요한 정보 확인)
            String userId = keycloakGetUserIdService.getUserIdWithToken(username, adminToken, realmParam);
            
            // 사용자 세션 생성을 위한 API 호출
            String tokenUrl = keycloakBaseUrl + "/realms/" + realmName + "/protocol/openid-connect/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // 토큰 요청 파라미터 설정
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", "ehr1");  // 클라이언트 ID
            body.add("client_secret", clientSecret); // 클라이언트 시크릿
            body.add("grant_type", "password");  // 그랜트 타입
            body.add("username", username);  // 사용자명
            
            // 프론트엔드에서 전달받은 비밀번호 사용
            if (password != null && !password.isEmpty()) {
                System.out.println("✅ 프론트엔드에서 제공받은 비밀번호 사용");
                body.add("password", password);
            } else {
                System.out.println("⚠️ 비밀번호가 제공되지 않았습니다. 토큰 발급이 실패할 수 있습니다.");
                // 비밀번호가 제공되지 않았을 경우 빈 값 전달
                body.add("password", "");
            }
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
            
            // 토큰 요청 (실제 구현은 Keycloak API에 맞게 수정 필요)
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, entity, Map.class);
            
            // 응답 처리
            if (tokenResponse.getStatusCode().is2xxSuccessful() && tokenResponse.getBody() != null) {
                Map<String, Object> tokenData = tokenResponse.getBody();
                
                // 응답 데이터 구성
                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("resData", tokenData);
                responseBody.put("rtnCode", "S000");
                responseBody.put("rtnMsg", "토큰이 성공적으로 발급되었습니다");
                
                // 헤더 설정
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.set("access_token", (String) tokenData.get("access_token"));
                responseHeaders.set("refresh_token", (String) tokenData.get("refresh_token"));
                
                return ResponseEntity.ok()
                        .headers(responseHeaders)
                        .body(responseBody);
            } else {
                throw new KeycloakException("토큰 발급 응답이 null이거나 성공적이지 않습니다.");
            }
        } catch (Exception e) {
            System.out.println("❌ 인증된 사용자 토큰 발급 실패: " + e.getMessage());
            throw new KeycloakException("❌ 인증된 사용자 토큰 발급 실패: " + e.getMessage(), e);
        }
    }
}
