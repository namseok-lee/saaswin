package saas.win.SaaSwin.snsLogin.naver.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.snsLogin.common.service.CommonAuthService;
import saas.win.SaaSwin.snsLogin.naver.service.NaverConnectService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/{rprsOgnzNo}/api/auth/naver")
public class NaverConnectController {
    private final NaverConnectService naverLoginService;
    private final StringRedisTemplate redisTemplate;
    private final CommonAuthService commonAuthService;
    @Value("${front.url}")
    private String frontUrl;

    @Operation(summary = "네이버 로그인", description = "로그인 - 네이버 로그인, 리다이렉션 값, 프로필 값 받아옴")
    @Description("로그인 - 네이버 로그인, 리다이렉션 값, 프로필 값 받아옴")
    @GetMapping("/callback/redirect")
    public void generateToken(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestParam(value = "code") String code,
            @RequestParam(value = "state") String stateJson,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String des,
            HttpServletResponse httpResponse
    ) throws IOException {
        // state 파라미터는 URL 인코딩된 JSON 문자열이므로 디코딩 후 JSON 객체로 변환
        String decodedState = java.net.URLDecoder.decode(stateJson, "UTF-8");

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

        // JSON을 Map으로 변환하여 state 값과 companyCd를 분리
        Map<String, Object> stateMap = objectMapper.readValue(decodedState, Map.class);

        // state에서 'companyCd' 값을 추출
        String companyCd = (String) stateMap.get("companyCd");
        String state = (String) stateMap.get("state");
        String userNo = (String) stateMap.get("user_no");

        // 나머지 상태 정보는 그대로 'state'로 저장
        Map<String, Object> remainingState = new HashMap<>(stateMap);
        remainingState.remove("companyCd");

        System.out.println("companyCd: " + companyCd);
        System.out.println("Remaining state: " + remainingState);

        // ✅ `login_type`과 `realm`을 `state`에서 받아오기 (기본값 설정)
        String loginType = Objects.toString(additionalParams.get("login_type"), "naver_select");
        String realm = Objects.toString(additionalParams.get("realm"), "WIN");
        if(code != null && state != null ){
            if(Boolean.TRUE.equals(redisTemplate.hasKey("login_" + state))){
                // TODO: sns 로그인시 고유 아이디 확인해서 없으면 로그인 X, 있으면 로그인 진행
                log.debug("네이버 로그인 서비스 진행");
                HashMap<String, Object> map = naverLoginService.getUserId(code, state);

                if (map == null) {
                    map = new HashMap<>(); // 빈 Map 할당 (안전한 처리)
                }

//                String ognz_no = map.get("ognz_no") != null ? trimQuotes(map.get("ognz_no").toString()) : "";
//                String user_no = map.get("user_no") != null ? trimQuotes(map.get("user_no").toString()) : "";
//                String rprs_ognz_no = map.get("rprs_ognz_no") != null ? trimQuotes(map.get("rprs_ognz_no").toString()) : "";

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


            } else if(Boolean.TRUE.equals(redisTemplate.hasKey("connect_" + state))) {
                // TODO: 여기서 valid 값 없으면 다시 로그인하게 시킴 ( valid값 유효시간 5분 )
//                log.debug("네이버 연동 서비스 진행");
                SswResponseDTO response = naverLoginService.saveInfo(code, state,userNo, companyCd,httpResponse);
//                return ResponseEntity.status(HttpStatus.OK).body(response);


            } else {
                log.debug("state값 에러");
                SswResponseDTO res = new SswResponseDTO();
                res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
                res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
//                return ResponseEntity.status(HttpStatus.OK).body(res);
            }

        } else if (error != null && des != null){
            // 에러 발생시만 값 출력
            log.debug("error: {}",error );
            log.debug("des: {}", des);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
//            return ResponseEntity.status(HttpStatus.OK).body(res);
        }
        // code, state, error, des가 모두 null인 경우
        SswResponseDTO res = new SswResponseDTO();
        res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
        res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
//        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    private String trimQuotes(String str) {
        if (str == null || str.length() < 2) {
            return str; // 길이가 2 미만이면 그대로 반환
        }

        if (str.startsWith("\"") && str.endsWith("\"")) {
            return str.substring(1, str.length() - 1);
        }

        return str;
    }

}