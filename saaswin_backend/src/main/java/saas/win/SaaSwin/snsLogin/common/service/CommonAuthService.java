package saas.win.SaaSwin.snsLogin.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.service.KeycloakAuthService;
import saas.win.SaaSwin.snsLogin.common.service.CommonQueryService;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommonAuthService {

    private final CommonQueryService commonQueryService;
    private final KeycloakAuthService keycloakAuthService;

    /**
     * ✅ 사용자 인증 및 Keycloak 토큰 발급 (SNS 로그인 공통 서비스)
     */
    public Map<String, Object> authenticateUser(
            Map<String, Object> additionalParams,
            Map<String, Object> userInfo,
            String loginType,
            String realm) {

        // ✅ SQL 요청 파라미터 설정
        Map<String, Object> requestParams = new HashMap<>();
        requestParams.put("sql_key", "hrs_login");
        requestParams.put("login_type", loginType);
        requestParams.put("rprs_ognz_no", additionalParams.get("companyCd"));
        // requestParams.put("sns_user", userInfo.get("email")); // ✅ 이메일을 sns_user로 사용
        requestParams.put("sns_user", userInfo.get("email")); // ✅ 이메일을 sns_user로 사용
        requestParams.put("sns_id", userInfo.get("id"));

        // ✅ 실행할 SQL ID 및 조회할 키 목록
        String sqlId = "hrs_login01";
        List<String> keysToExtract = Arrays.asList("easy_return", "user_id", "pswd", "ognz_no", "user_no",
                "rprs_ognz_no");

        // ✅ 공통 서비스 호출 (DB 조회)
        Map<String, Object> result = commonQueryService.executeQuery(sqlId, requestParams, keysToExtract);

        String user_id = Objects.toString(result.get("user_id"), "");
        String pswd = Objects.toString(result.get("pswd"), "");
        String user_no = Objects.toString(result.get("user_no"), "");
        String ognz_no = Objects.toString(result.get("ognz_no"), "");
        String rprs_ognz_no = Objects.toString(result.get("rprs_ognz_no"), "");
        String pswd_lck_nocs = Objects.toString(result.get("pswd_lck_nocs"), "");
        String currentFailCount = Objects.toString(result.get("current_fail_count"), "");
        String accessToken = "";
        String refreshToken = "";
        String acntSttsCd = Objects.toString(result.get("acnt_stts_cd"),"");

        if (user_id != null && pswd != null) {
            // ✅ Keycloak 인증 토큰 발급
            KeycloakTokenRequestDto requestDto = new KeycloakTokenRequestDto();
            requestDto.setUsername(user_id);
            requestDto.setPassword(pswd);
            requestDto.setRealm(realm); // ✅ 동적으로 realm 설정

            try {
                KeycloakTokenResponseDto tokenResponse = keycloakAuthService.getToken(requestDto);
                accessToken = Objects.toString(tokenResponse.getAccessToken(), "");
                refreshToken = Objects.toString(tokenResponse.getRefreshToken(), "");
            } catch (Exception e) {
                log.warn("Keycloak 토큰 발급 실패, 토큰 없이 진행: {}", e.getMessage());
            }
        }

        // ✅ 결과 맵 반환
        Map<String, Object> authResult = new HashMap<>();
        authResult.put("access_token", accessToken);
        authResult.put("refresh_token", refreshToken);
        authResult.put("user_no", user_no);
        authResult.put("ognz_no", ognz_no);
        authResult.put("rprs_ognz_no", rprs_ognz_no);
        authResult.put("login_type", loginType);
        authResult.put("pswd_lck_nocs", pswd_lck_nocs);
        authResult.put("realm", realm);
        authResult.put("acnt_stts_cd",acntSttsCd);
        authResult.put("current_fail_count",currentFailCount);

        return authResult;
    }
}
