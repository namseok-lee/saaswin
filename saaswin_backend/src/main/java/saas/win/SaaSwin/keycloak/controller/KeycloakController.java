package saas.win.SaaSwin.keycloak.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.keycloak.dto.*;
import saas.win.SaaSwin.keycloak.service.*;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.util.SHA512Util;

import java.security.MessageDigest;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/{rprsOgnzNo}/api/keycloak")
@RequiredArgsConstructor
public class KeycloakController {

    private final KeycloakAuthService keycloakAuthService;
    private final KeycloakIntrospectService keycloakIntrospectService;
    private final KeycloakRefreshTokenService keycloakRefreshTokenService;
    private final KeycloakCreateUserService keycloakCreateUserService;
    private final KeycloakGetUserIdService keycloakGetUserIdService;
    private final KeycloakPasswordService keycloakPasswordService;
    private final KeycloakSessionService keycloakSessionService;
    private final StringRedisTemplate redisTemplate;
    private final SqlService sqlService;

    /**
     * Keycloak 액세스 토큰 요청
     * @param requestDto 사용자 로그인 정보
     * @return Keycloak 토큰 응답 DTO
     */
    @PostMapping("/token")
    public ResponseEntity<Map<String, Object>> getToken(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody KeycloakTokenRequestDto requestDto, @RequestParam("user_id") String user_id) {
        System.out.println("Token 요청 받음: username = " + requestDto.getUsername());
        
        // 사용자 세션 확인
        ResponseEntity<Map<String, Object>> sessionResponse = keycloakSessionService.checkUserSessions(requestDto.getUsername(), rprsOgnzNo, user_id);
        if (sessionResponse != null) {
            System.out.println("✅ User(" + requestDto.getUsername() + ")의 active session이 존재합니다. Session 정보를 반환합니다.");
            
            // 세션 정보에 메시지 추가
            Map<String, Object> responseBody = sessionResponse.getBody();
            if (responseBody != null) {
                responseBody.put("sessionStatus", "ACTIVE");
                responseBody.put("sessionMessage", "Active session exists");
            }
            
            return sessionResponse; // 이미 세션이 존재하면 해당 세션 정보 반환
        }
        
        System.out.println("❌ User(" + requestDto.getUsername() + ")의 active session이 없습니다. 새로운 token을 발급합니다.");
        
        keycloakSessionService.logoutUserSessions(requestDto.getUsername(), rprsOgnzNo); // 기존 세션 로그아웃
        requestDto.setPassword(requestDto.getPassword());
        requestDto.setRealm(rprsOgnzNo);
        KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(requestDto);

        // 🔹 HttpHeaders 객체 생성 및 헤더 값 추가
        HttpHeaders headers = new HttpHeaders();
        headers.set("access_token", tokenResponse.getAccessToken()); // ✅ 액세스 토큰을 헤더에 추가
        headers.set("refresh_token", tokenResponse.getRefreshToken()); // ✅ 리프레시 토큰을 헤더에 추가

        // 🔹 응답 데이터를 Map에 넣기 (resData 키 사용)
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("resData", tokenResponse); // ✅ tokenResponse를 resData 키로 감싸서 응답
        responseBody.put("rtnCode", SswConstants.RESULT_CODE_SUCCESS); // ✅ tokenResponse를 resData 키로 감싸서 응답
        responseBody.put("sessionStatus", "NEW");
        responseBody.put("sessionMessage", "새로운 세션이 생성되었습니다.");

        // ✅ ResponseEntity에 body(응답 데이터) + headers(헤더) 포함
        return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
    }

    /**
     * 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
     * @param request 리프레시 토큰
     * @return 새 액세스 토큰 응답 DTO
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshAccessToken(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody KeycloakRefreshTokenRequestDto request) {
        KeycloakRefreshTokenResponseDto tokenResponse = keycloakRefreshTokenService.refreshToken(request);
        // 🔹 HttpHeaders 객체 생성 및 헤더 값 추가
        HttpHeaders headers = new HttpHeaders();
        headers.set("access_token", tokenResponse.getAccessToken()); // ✅ 액세스 토큰을 헤더에 추가
        headers.set("refresh_token", tokenResponse.getRefreshToken()); // ✅ 리프레시 토큰을 헤더에 추가

        // 🔹 응답 데이터를 Map에 넣기
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("resData", tokenResponse); // ✅ tokenResponse를 resData 키로 감싸서 응답
        responseBody.put("rtnCode", SswConstants.RESULT_CODE_SUCCESS);

        return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
    }

    /**
     * Keycloak 토큰 유효성 검사(Introspection)
     * @param request 토큰 검증 요청 정보
     * @return Keycloak 토큰 검증 결과 DTO
     */
    @PostMapping("/introspect")
    public ResponseEntity<KeycloakIntrospectResponseDto> introspectToken(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody KeycloakIntrospectRequestDto request) {
        return ResponseEntity.ok(keycloakIntrospectService.introspectToken(request));
    }

    /**
     * Keycloak 사용자 등록 API
     * @param requestDto 사용자 정보 (JSON 요청)
     * @return Keycloak 응답
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestBody KeycloakUserRequestDto requestDto
    ) {
        return keycloakCreateUserService.registerUser(requestDto);
    }

    /**
     * Keycloak 비밀번호 변경 API
     * @param requestDto 비밀번호 변경 정보
     * @return Keycloak 응답
     */
    @PutMapping("/update-password")
    public ResponseEntity<String> updatePassword(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestBody KeycloakUpdatePasswordRequestDto requestDto
    ) {
        // 1️⃣ 먼저 사용자 ID 조회
//        String userId = keycloakGetUserIdService.getUserId(requestDto.getUsername());

        // 2️⃣ 조회된 사용자 ID로 비밀번호 변경 요청
        return keycloakPasswordService.updatePassword( requestDto);
    }

    /**
     * Keycloak 사용자 세션 종료 (logout)
     * @param username 사용자 ID
     * @return Keycloak 성공, 실패 메세지
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody String username) {
        return keycloakSessionService.logoutUserSessions(username, rprsOgnzNo);
    }

    /**
     * Redis에 저장된 인증 코드 검증
     * @param requestDto 사용자명과 인증 코드를 포함한 요청 객체
     * @return 검증 결과
     */
    @PostMapping("/verify-auth-code")
    public ResponseEntity<Map<String, Object>> verifyAuthCode(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody KeycloakAuthCodeVerifyRequestDto requestDto) {
        // 요청 값 출력
        System.out.println("=== 인증 코드 검증 요청 ===");
        System.out.println("요청 사용자명: " + requestDto.getUsername());
        System.out.println("요청 인증 코드: " + requestDto.getAuthCode());
        System.out.println("비밀번호 제공 여부: " + (requestDto.getPassword() != null && !requestDto.getPassword().isEmpty() ? "O" : "X"));
        
        Map<String, Object> response = new HashMap<>();
        
        // Redis에서 저장된 인증 코드 가져오기
        try {
            // Redis에서 저장된 인증 코드 가져오기
            SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
            String sqlId = SqlConstants.REDIS_SQL_LOGIN_01;
            String sql_key = SqlConstants.REDIS_SQL_ALG_KEY_07;
            sqlDto.setSqlId(sqlId);
            sqlDto.setSql_key(sql_key);
            
            Map<String, Object> paramMap = new HashMap<>();
            paramMap.put("user_no", requestDto.getUser_no());
            paramMap.put("user_id", requestDto.getUsername());
            paramMap.put("cert_num", requestDto.getAuthCode());
            paramMap.put("idnty_knd", "keycloak");
            List<Map<String, Object>> params = new ArrayList<>();
            params.add(paramMap);
            sqlDto.setParams(params);
            
            List<Map<String, Object>> result = sqlService.executeQuery_select_for_func(sqlDto);
            
            Map<String, Object> resMap = (Map)result.get(0).get("data");
            List<Map<String, Object>> innerData = (List<Map<String, Object>>) resMap.get("data");
            Map<String, Object> inner =(Map<String, Object>) innerData.get(0).get("saaswin_hrs_pswd_reset_cert_idnty");
            List<Map<String, Object>> errJson = (List<Map<String, Object>>) inner.get("err_json");
            List<Map<String, Object>> sucJson = (List<Map<String, Object>>) inner.get("suc_json");
            String returnCd = (String) resMap.get("return_cd");
            String successString = null;
            String errorMsg = null;
            if (sucJson != null && !sucJson.isEmpty() && sucJson.get(0) != null) {
                successString = (String) sucJson.get(0).get("verified_at");
            }

            // errJson null 체크
            if (errJson != null && !errJson.isEmpty() && errJson.get(0) != null) {
                errorMsg = (String) errJson.get(0).get("error_msg");
            }
            if("40002".equals(returnCd)) { 
                if (errorMsg != null) {
                    response.put("rtnMsg", errorMsg);
                    response.put("rtnCode", "ERROR");
                } else {
                    response.put("rtnCode", "SUCCESS");
                    response.put("rtnMsg", successString);
                }
                // 성공 응답 처리
                return ResponseEntity.ok(response);
            } else {
                response.put("rtnCode", "ERROR");
                response.put("rtnMsg", "인증 코드가 유효하지 않습니다");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            // 기타 예외 처리
            System.err.println("예상치 못한 오류: " + e.getMessage());
            response.put("rtnCode", "ERROR");
            response.put("rtnMsg", "시스템 오류가 발생했습니다.");
        }
        return ResponseEntity.ok(response);
        
        // 인증 코드 검증
        // boolean isValid = requestDto.getAuthCode() != null && requestDto.getAuthCode().equals("40002");
        
        // if (isValid) {
        //     // 인증 성공 시 Redis에서 해당 코드 삭제
        //     redisTemplate.delete("keycloak_auth_" + requestDto.getUsername());
        //     System.out.println("✅ User(" + requestDto.getUsername() + ")의 인증 코드가 검증되어 Redis에서 삭제되었습니다.");
            
        //     // 인증 성공 시 토큰 발급
        //     try {
        //         // 먼저 기존 세션 로그아웃 처리
        //         keycloakSessionService.logoutUserSessions(requestDto.getUsername(), rprsOgnzNo);
                
        //         // 새 토큰 발급 - 일반 로그인 흐름에서 세션 확인을 건너뛰고 직접 토큰 발급
        //         // 참고: 실제 구현에서는 인증된 사용자의 토큰을 발급하기 위한 적절한 방법이 필요합니다.
        //         // 이 예제에서는 KeycloakSessionService의 내부 메서드를 활용합니다.
                
        //         // 세션 정보 대신 토큰 정보를 담을 응답 객체 생성
        //         ResponseEntity<Map<String, Object>> tokenResponse = keycloakSessionService.getTokenForVerifiedUser(
        //                 requestDto.getUsername(), 
        //                 requestDto.getPassword() != null ? SHA512Util.hashSHA512(requestDto.getPassword()) : "",
        //                 rprsOgnzNo
        //         );
                
        //         if (tokenResponse != null && tokenResponse.getBody() != null) {
        //             // 토큰 발급 성공
        //             response.putAll(tokenResponse.getBody());
        //             response.put("rtnCode", SswConstants.RESULT_CODE_SUCCESS);
        //             response.put("rtnMsg", "인증 코드가 유효합니다");
        //             response.put("verified", true);
                    
        //             // 응답 헤더에서 토큰 정보 가져오기
        //             HttpHeaders originalHeaders = tokenResponse.getHeaders();
        //             HttpHeaders headers = new HttpHeaders();
                    
        //             if (originalHeaders.containsKey("access_token")) {
        //                 headers.set("access_token", originalHeaders.getFirst("access_token"));
        //             }
                    
        //             if (originalHeaders.containsKey("refresh_token")) {
        //                 headers.set("refresh_token", originalHeaders.getFirst("refresh_token"));
        //             }
                    
        //             return ResponseEntity.ok()
        //                     .headers(headers)
        //                     .body(response);
        //         } else {
        //             throw new Exception("토큰 발급 결과가 null입니다.");
        //         }
        //     } catch (Exception e) {
        //         System.out.println("❌ 토큰 발급 실패: " + e.getMessage());
        //         response.put("rtnCode", "E002");
        //         response.put("rtnMsg", "인증은 성공했으나 토큰 발급에 실패했습니다: " + e.getMessage());
        //         response.put("verified", true);
        //         return ResponseEntity.ok(response);
        //     }
        // } else {
        //     response.put("rtnCode", "E001");
        //     response.put("rtnMsg", "인증 코드가 유효하지 않습니다");
        //     response.put("verified", false);
        //     return ResponseEntity.ok(response);
        // }
    }

    /**
     * Keycloak 사용자 등록 API
     * @param requestDto 사용자 정보 (JSON 요청)
     * @return Keycloak 응답
     */
    @PostMapping("/partialImport")
    public ResponseEntity<String> partialImport(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestBody List<KeycloakUserRequestDto> users
    ) {
        return keycloakCreateUserService.bulkRegisterUsers(rprsOgnzNo, users);
    }

    /**
     * Keycloak 사용자 수정 API
     * @param requestDto 사용자 정보 (JSON 요청)
     * @return Keycloak 응답
     */
    @PostMapping("/bulkUpdate")
    public ResponseEntity<String> bulkUpdate(
            @PathVariable("rprsOgnzNo") String realm,
            @RequestBody List<KeycloakUserRequestDto> users
    ) {
        return keycloakCreateUserService.bulkUpdateUsers(realm, users);
    }

    /**
     * Keycloak 사용자 비활성화 API
     * @param realm Keycloak Realm
     * @param usernames 사용자 이름 리스트
     * @return Keycloak 응답
     */
    @PostMapping("/bulkDisable")
    public ResponseEntity<String> bulkDisable(
            @PathVariable("rprsOgnzNo") String realm,
            @RequestBody List<String> usernames
    ) {
        return keycloakCreateUserService.bulkDisableUsers(realm, usernames);
    }

    /**
     * Keycloak 사용자 재활성화 API
     * @param realm Keycloak Realm
     * @param usernames 사용자 이름 리스트
     * @return Keycloak 응답
     */
    @PostMapping("/bulkEnable")
    public ResponseEntity<String> bulkEnableUsers(
            @PathVariable("rprsOgnzNo") String realm,
            @RequestBody List<String> usernames
    ) {
        return keycloakCreateUserService.bulkEnableUsers(realm, usernames);
    }
    
}
