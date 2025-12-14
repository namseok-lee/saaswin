package saas.win.SaaSwin.snsLogin.kakao.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.snsLogin.common.service.CommonAuthService;
import saas.win.SaaSwin.snsLogin.kakao.service.KakaoService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/{rprsOgnzNo}/api/auth/kakao")
public class KakaoController {

    private final KakaoService kakaoService;
    private final CommonAuthService commonAuthService;
    private final StringRedisTemplate redisTemplate;

    @Value("${front.url}")
    private String frontUrl;


    @Value("${kakao.login.api.client-id}")
    private String clientId;

    @Value("${kakao.login.api.redirect-uri}")
    private String redirectUri;

    @Operation(summary = "카카오 로그인 코드 생성", description = "로그인 - 카카오 로그인 코드 받기")
    @Description("로그인 - 카카오 로그인 코드 받기")
    @PostMapping("/code")
    public String generateCode(@PathVariable("rprsOgnzNo") String rprsOgnzNo) {
        log.debug("카카오 로그인 코드 실행 완료");
        StringBuffer url = new StringBuffer();
        url.append("https://kauth.kakao.com/oauth/authorize?");
        url.append("client_id="+clientId);
        url.append("&redirect_uri="+redirectUri);
        url.append("&response_type=code");
        return "redirect:" + url.toString();
//        kakaoService.generateCode();
    }

    @Operation(summary = "카카오 로그인 accessToken, id, email 받기", description = "카카오 로그인 accessToken 생성 및 id, email 받기")
    @Description("카카오 로그인 accessToken 생성 및 id, email 받기")
    @GetMapping("/callback/redirect")
    public void generate(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestParam(value = "code") String code,
            @RequestParam(value = "state", required = false) String stateJson,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String des,
            HttpServletResponse httpResponse
    ) throws URISyntaxException, IOException {
        log.debug("code값 화확인: {}" ,code);
        log.debug("리다이렉트 완료");

        String userNo = null;

        // ✅ state 값이 있으면 JSON 파싱
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> additionalParams = new HashMap<>();

        if (stateJson != null) {
            try {
                additionalParams = objectMapper.readValue(stateJson, HashMap.class);
                System.out.println("추가 전달된 데이터: " + additionalParams);
            } catch (Exception e) {
                System.err.println("state 파싱 오류: " + e.getMessage());
            }
        }

        String state = (String) additionalParams.get("state");
        String companyCd = (String) additionalParams.get("companyCd");

        if (additionalParams.containsKey("user_no") && additionalParams.get("user_no") != null) {
            userNo = (String) additionalParams.get("user_no");
        }


        // ✅ `login_type`과 `realm`을 `state`에서 받아오기 (기본값 설정)
        String loginType = Objects.toString(additionalParams.get("login_type"), "kakao_select");
        String realm = Objects.toString(additionalParams.get("realm"), "WIN");

        if(code != null && state != null ) {
            if (Boolean.TRUE.equals(redisTemplate.hasKey("login_" + state))) {
                HashMap<String, Object> map =  kakaoService.generateToken(code);
                log.debug("로그인 실행됨");
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", map.get("sns_id"));
                userInfo.put("email", map.get("sns_user"));
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
                        "%s/gateway?user_no=%s&ognz_no=%s&rprs_ognz_no=%s&login_type=%s&pswd_lck_nocs=%s&acnt_stts_cd=%s&current_fail_count=%s",
                        frontUrl, user_no, ognz_no, rprs_ognz_no, loginType, pswd_lck_nocs,acnt_stts_cd,current_fail_count
                );

                if (!accessToken.isEmpty() && !refreshToken.isEmpty()) {
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
            } else if (Boolean.TRUE.equals(redisTemplate.hasKey("connect_" + state))) {
                log.debug("카카오 연동 실행");
                if (userNo != null) {
                    log.debug("연동하기 코스 탐");
                    // TODO: 여기서 valid 값 없으면 다시 로그인하게 시킴 ( valid값 유효시간 5분 )
                    SswResponseDTO response = kakaoService.saveInfo(code, state, userNo, companyCd, httpResponse);

                }
            }
        }
    }
}