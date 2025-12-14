package saas.win.SaaSwin.snsLogin.kakao.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.core.util.Json;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
public class KakaoService {

    @Value("${kakao.login.api.client-id}")
    private String clientId;

    @Value("${kakao.login.api.redirect-uri}")
    private String redirectUri;

    @Value("${front.url}")
    private String FRONT_URL;

    ObjectMapper objectMapper = new ObjectMapper();
    private final SswService sswService;

    @Transactional
    public HashMap<String, Object> generateToken(String code) throws URISyntaxException, JsonProcessingException {

        StringBuffer url = new StringBuffer();
        url.append("https://kauth.kakao.com/oauth/token?");
        url.append("&grant_type=authorization_code");
        url.append("&client_id="+clientId);
        url.append("&redirect_uri="+redirectUri);
        url.append("&code=" + code);
        log.debug("생성된 URI: {}", url);

        // 1. accessToken 요청

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        // HTTP 요청 보내기
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(url.toString(), HttpMethod.GET, entity, String.class);

        log.debug("response {}" , response);
        log.debug("응답 상태 코드: {}", response.getStatusCode());
        log.debug("응답 헤더: {}", response.getHeaders());
        log.debug("응답 본문: {}", response.getBody());

        JsonNode rootNode = objectMapper.readTree(response.getBody());

        log.debug("rootNode {}", rootNode);

        String accessToken = rootNode.has("access_token") ? rootNode.get("access_token").asText() : null;
        log.debug("access_token {}", accessToken);

        return generateUserInfo(accessToken);


    }

    // 받아온 토큰으로 유저 정보 요청
    public HashMap<String, Object> generateUserInfo(String accessToken) throws JsonProcessingException {
        StringBuffer url = new StringBuffer();
        url.append("https://kapi.kakao.com/v2/user/me");

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        headers.set("Authorization", "Bearer " + accessToken);

        // HTTP 요청 보내기
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(url.toString(), HttpMethod.GET, entity, String.class);
        log.debug("response {}" , response);
        log.debug("응답 상태 코드: {}", response.getStatusCode());
        log.debug("응답 헤더: {}", response.getHeaders());
        log.debug("응답 본문: {}", response.getBody());

        JsonNode rootNode = objectMapper.readTree(response.getBody());

        // 카카오 고유 아이디
        String id = rootNode.has("id") ? rootNode.get("id").asText() : null;
        log.debug("id {}", id);

        // 카카오 이메일
        String email = rootNode.has("kakao_account") ? rootNode.at("/kakao_account/email").asText() : null;
        log.debug("email {}", email);

        HashMap<String, Object> map = new HashMap<>();
        map.put("sns_id", id);
        map.put("sns_user", email);

        return map;

    }

    public SswResponseDTO saveInfo(String code, String state, String userNo, String companyCd, HttpServletResponse httpResponse) {
        log.debug("code 값 확인 22222: {}" , code);
        try {
            // accessToken 요청 URI 생성
            StringBuffer url = new StringBuffer();
            url.append("https://kauth.kakao.com/oauth/token?");
            url.append("&grant_type=authorization_code");
            url.append("&client_id="+clientId);
            url.append("&redirect_uri="+redirectUri);
            url.append("&code=" + code);

            URI uri = new URI(url.toString());
            log.debug("생성된 URI: {}", uri);

            // 1. accessToken 요청
            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

            // HTTP 요청 보내기
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

            log.debug("응답 상태 코드: {}", response.getStatusCode());
            log.debug("응답 헤더: {}", response.getHeaders());
            log.debug("응답 본문: {}", response.getBody());

            // 응답 본문 파싱 (JSON -> Map)
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> parsedResponse = objectMapper.readValue(response.getBody(), Map.class);

            // 2. 프로필 요청
            // accessToken 추출
            String accessToken = (String)parsedResponse.get("access_token");
            log.debug("추출된 Access Token: {}", accessToken);

            // 고유id 요청 uri 생성
            String userInfoUrl = "https://kapi.kakao.com/v2/user/me";
            URI userInfoUri = new URI(userInfoUrl);

            // HTTP 요청 보내기
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> userInfoEntity = new HttpEntity<>(userInfoHeaders);

            // 응답 값
            ResponseEntity<String> userInfoResponse = restTemplate.exchange(userInfoUri, HttpMethod.GET, userInfoEntity, String.class );
            log.debug("사용자 정보 응답 상태 코드: {}", userInfoResponse.getStatusCode());
            log.debug("사용자 정보 응답 본문: {}", userInfoResponse.getBody());

            // 응답 값에서 이메일과 id 파싱
            JsonNode rootNode = objectMapper.readTree(userInfoResponse.getBody());
            JsonNode idNode = rootNode.get("id");
            JsonNode emailNode = rootNode.get("kakao_account").get("email");

            String userId = (idNode != null) ? idNode.asText() : null;
            String email = (emailNode != null) ? emailNode.asText() : null;
            // 로그 출력
            log.debug("카카오 고유 id: {}", userId);
            log.debug("카카오 이메일: {}", email);

            // 사용자 정보 파싱
            Map<String, Object> userInfo = objectMapper.readValue(userInfoResponse.getBody(), Map.class);
            log.debug("사용자 정보: {}", userInfo);

            // TODO: 연동하기시 받아온 값을 통해서 DB에 값 저장 - email, 고유 id 값을 tsm_user에 저장 | 성공, 실패 확인까지만
            HashMap<String, Object> map = new HashMap<>();
            map.put("sql_key", "hrs_login");
            map.put("login_type", "kakao_update");
            map.put("user_no", userNo);
            map.put("rprs_ognz_no", companyCd);
            map.put("sns_user",email);
            map.put("sns_id",userId);

            ArrayList<Map<String, Object>> params = new ArrayList<>();
            params.add(map);

            SswRequestSqlDTO sswRequestSqlDTO = new SswRequestSqlDTO();
            sswRequestSqlDTO.setSqlId("hrs_login01");
            sswRequestSqlDTO.setParams(params);

            ArrayList<SswRequestSqlDTO> requestList = new ArrayList<>();
            requestList.add(sswRequestSqlDTO);
            SswResponseDTO responseDTO = sswService.ssw0002(requestList, false);
            log.debug("responseDTO {}", responseDTO);

//        httpResponse.sendRedirect(FRONT_URL + "/settings/basicSetting/loginInfo/SB001");
            httpResponse.sendRedirect(FRONT_URL+"/connectGateway");

        } catch (URISyntaxException e) {
            log.debug("URI 에러 발생" + e.getMessage());
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return res;
        } catch (JsonMappingException e) {
            log.debug("Json 매핑 에러" + e.getMessage());
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return res;
        } catch (JsonProcessingException e) {
            log.debug("Json 과정중 에러 발생" + e.getMessage());
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return res;
        } catch (ParseException e) {
            log.debug("파싱 에러 발생" + e.getMessage());
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return res;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return null;
    }
}