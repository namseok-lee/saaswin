package saas.win.SaaSwin.snsLogin.google.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.snsLogin.naver.dto.response.NaverConnectResponseDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.service.SswService;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    @Value("${google.lgoin.api.client-id}")
    private String googleClientId;

    @Value("${google.login.api.client-secret}")
    private String googleClientSecret;

    @Value("${google.login.api.redirect-uri}")
    private String googleRedirectUri;
    @Value("${front.url}")
    private String FRONT_URL;
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

    private final RestTemplate restTemplate = new RestTemplate();
    private final SswService sswService;
    /**
     * Google에서 받은 인증 코드(code)를 이용해 access_token 요청 후 사용자 정보 가져오기
     * @param code Google OAuth에서 전달한 인증 코드
     * @return 사용자 정보 Map
     */
    public Map<String, Object> exchangeCodeForTokenAndUserInfo(String code) {
        String accessToken = getAccessToken(code);
        return getUserInfo(accessToken);
    }

    /**
     * Google 서버에 code를 보내 access_token을 받아오는 메서드
     * @param code Google OAuth에서 반환한 인증 코드
     * @return access_token 값
     */
    private String getAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String requestBody = "code=" + code +
                "&client_id=" + googleClientId +
                "&client_secret=" + googleClientSecret +
                "&redirect_uri=" + googleRedirectUri +
                "&grant_type=authorization_code";

        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(GOOGLE_TOKEN_URL, HttpMethod.POST, request, Map.class);

        Map<String, Object> tokenBody = response.getBody();
        if (tokenBody == null || !tokenBody.containsKey("access_token")) {
            throw new RuntimeException("Failed to retrieve access token from Google");
        }

        return (String) tokenBody.get("access_token");
    }

    /**
     * access_token을 사용해 Google 사용자 정보를 가져오는 메서드
     * @param accessToken Google OAuth에서 받은 access_token
     * @return 사용자 정보 Map
     */
    private Map<String, Object> getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(GOOGLE_USER_INFO_URL, HttpMethod.GET, request, Map.class);
        Map<String, Object> userInfo = response.getBody();

        if (userInfo == null) {
            throw new RuntimeException("Failed to retrieve user info from Google");
        }

        return userInfo;
    }

    public SswResponseDTO saveInfo(String code, String state, String userNo, String companyCd, HttpServletResponse httpResponse) {
        log.debug("서비스 실행");
        try {


            // 사용자 정보 파싱
            Map<String, Object> userInfo = exchangeCodeForTokenAndUserInfo(code);
            log.debug("사용자 정보: {}", userInfo);

            // TODO: 연동하기시 받아온 값을 통해서 DB에 값 저장 - email, 고유 id 값을 tsm_user에 저장 | 성공, 실패 확인까지만
            HashMap<String, Object> map = new HashMap<>();
            map.put("sql_key", "hrs_login");
            map.put("login_type", "google_update");
            map.put("user_no", userNo);
            map.put("rprs_ognz_no", companyCd);
            map.put("sns_user",userInfo.get("email"));
            map.put("sns_id",userInfo.get("id"));

            ArrayList<Map<String, Object>> params = new ArrayList<>();
            params.add(map);

            SswRequestSqlDTO sswRequestSqlDTO = new SswRequestSqlDTO();
            sswRequestSqlDTO.setSqlId("hrs_login01");
            sswRequestSqlDTO.setParams(params);

            ArrayList<SswRequestSqlDTO> requestList = new ArrayList<>();
            requestList.add(sswRequestSqlDTO);
            SswResponseDTO responseDTO = sswService.ssw0002(requestList, false);
            log.debug("responseDTO {}", responseDTO);
//            httpResponse.sendRedirect(FRONT_URL+"/settings/basicSetting/loginInfo/SB001");
            httpResponse.sendRedirect(FRONT_URL+"/connectGateway");



        } catch (ParseException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        // 알 수 없는 에러 발생
        SswResponseDTO res = new SswResponseDTO();
        res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
        res.setRtnMsg("알 수 없는 응답 코드");
        return res;
    }
}
