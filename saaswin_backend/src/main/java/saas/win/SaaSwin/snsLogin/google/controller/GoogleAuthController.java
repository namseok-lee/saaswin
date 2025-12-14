package saas.win.SaaSwin.snsLogin.google.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.keycloak.dto.KeycloakRefreshTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakTokenResponseDto;
import saas.win.SaaSwin.keycloak.service.KeycloakAuthService;
import saas.win.SaaSwin.snsLogin.common.service.CommonAuthService;
import saas.win.SaaSwin.snsLogin.common.service.CommonQueryService;
import saas.win.SaaSwin.snsLogin.google.dto.GoogleAuthResponseDto;
import saas.win.SaaSwin.snsLogin.google.service.GoogleAuthService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import lombok.extern.slf4j.Slf4j;
import java.io.IOException;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/{rprsOgnzNo}/api/auth/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;
    private final CommonAuthService commonAuthService;
    private final StringRedisTemplate redisTemplate;
    @Value("${front.url}")
    private String front_url;

    /**
     * Google OAuth 로그인 후, 리디렉트되는 엔드포인트
     * @param code Google에서 반환한 인증 코드
     * @return 사용자 정보
     */
    @GetMapping("/callback/redirect")
    public void googleCallback(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestParam("code") String code,
            @RequestParam("state") String stateJson,
            HttpServletResponse httpResponse) throws IOException {  // ✅ state 추가
        ObjectMapper objectMapper = new ObjectMapper();


        // ✅ state 값이 있으면 JSON 파싱
        Map<String, Object> additionalParams = new HashMap<>();
        if (stateJson != null) {
            try {
                additionalParams = objectMapper.readValue(stateJson, HashMap.class);
                System.out.println("추가 전달된 데이터: " + additionalParams);
            } catch (Exception e) {
                System.err.println("state 파싱 오류: " + e.getMessage());
            }
        }
        String state = additionalParams.get("state").toString();


        if(Boolean.TRUE.equals(redisTemplate.hasKey("login_" + state))){
        // ✅ Google API를 통해 사용자 정보 가져오기
        Map<String, Object> googleInfo = googleAuthService.exchangeCodeForTokenAndUserInfo(code);


        // ✅ `login_type`과 `realm`을 `state`에서 받아오기 (기본값 설정)
        String loginType = Objects.toString(additionalParams.get("login_type"), "google_select");
        String realm = Objects.toString(additionalParams.get("realm"), "WIN");


        Map<String, Object> userInfo =  new HashMap<>();
        userInfo.put("id", googleInfo.get("id"));
        userInfo.put("email", googleInfo.get("email"));
        // ✅ 공통 인증 서비스 호출
        Map<String, Object> authResult = commonAuthService.authenticateUser(additionalParams, userInfo, loginType, realm);

        String accessToken = (String) authResult.get("access_token");
        String refreshToken = (String) authResult.get("refresh_token");
        String user_no = (String) authResult.get("user_no");
        String ognz_no = (String) authResult.get("ognz_no");
        String rprs_ognz_no = (String) authResult.get("rprs_ognz_no");
        String pswd_lck_nocs = (String) authResult.get("pswd_lck_nocs");
        String acnt_stts_cd = (String) authResult.get("acnt_stts_cd");
        String current_fail_count = (String) authResult.get("currentFailCount");

        // ✅ 리디렉트 URL 생성
        String redirectUrl = String.format(
                front_url + "/gateway?user_no=%s&ognz_no=%s&rprs_ognz_no=%s&login_type=%s&pswd_lck_nocs=%s&acnt_stts_cd=%s&current_fail_count=%s",
                user_no, ognz_no, rprs_ognz_no, loginType, pswd_lck_nocs,acnt_stts_cd,current_fail_count
        );

        if(!accessToken.isEmpty() && !refreshToken.isEmpty()) {
            // ✅ access_token 쿠키 추가
            Cookie cookie = new Cookie("access_token", accessToken);
            cookie.setHttpOnly(false);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(60);

            // ✅ refresh_token 쿠키 추가
            Cookie cookie2 = new Cookie("refresh_token", refreshToken);
            cookie2.setHttpOnly(false);
            cookie2.setSecure(false);
            cookie2.setPath("/");
            cookie2.setMaxAge(60);

            httpResponse.addCookie(cookie);
            httpResponse.addCookie(cookie2);
        }

        // ✅ 302 리디렉트 수행
        httpResponse.sendRedirect(redirectUrl);
        } else if(Boolean.TRUE.equals(redisTemplate.hasKey("connect_" + state))) {
            String userNo = additionalParams.get("user_no").toString();
            String companyCd = additionalParams.get("companyCd").toString();
            // TODO: 여기서 valid 값 없으면 다시 로그인하게 시킴 ( valid값 유효시간 5분 )
//                log.debug("구글 연동 서비스 진행");
            SswResponseDTO response = googleAuthService.saveInfo(code, state, userNo, companyCd, httpResponse);
//            return ResponseEntity.status(HttpStatus.OK).body(response);


        } else {
            log.debug("state값 에러");
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
//                return ResponseEntity.status(HttpStatus.OK).body(res);
        }
    }
}
