package saas.win.SaaSwin.snsLogin.naver.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.snsLogin.naver.controller.NaverConnectController;
import saas.win.SaaSwin.snsLogin.naver.dto.request.NaverConnectRequestDTO;
import saas.win.SaaSwin.snsLogin.naver.dto.response.NaverConnectResponseDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;
import saas.win.SaaSwin.ssw.service.SswService;
import saas.win.SaaSwin.util.SswUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NaverConnectService {

    @Value("${naver.login.api.client-id}")
    private String clientId;

    @Value("${naver.login.api.client-secret}")
    private String clientSecret;

    private final SqlService sqlService;
    private final SswService sswService;

    @Value("${front.url}")
    private String FRONT_URL;

    public HashMap<String,Object> getUserId(String code, String state) {
        try {
//            List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();

            // accessToken 요청 URI 생성
            String uriString = String.format(
                    "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=%s&client_secret=%s&code=%s&state=%s",
                    clientId, clientSecret, code, state
            );

            URI uri = new URI(uriString);
            log.debug("생성된 URI: {}", uri);

            // 1. accessToken 요청
            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

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
            String userInfoUrl = "https://openapi.naver.com/v1/nid/me";
            URI userInfoUri = new URI(userInfoUrl);

            // HTTP 요청 보내기
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> userInfoEntity = new HttpEntity<>(userInfoHeaders);

            // 응답 값 (프로필)
            ResponseEntity<String> userInfoResponse = restTemplate.exchange(userInfoUri, HttpMethod.GET, userInfoEntity, String.class );
            log.debug("사용자 정보 응답 상태 코드: {}", userInfoResponse.getStatusCode());
            log.debug("사용자 정보 응답 본문: {}", userInfoResponse.getBody());

            // 응답 값에서 이메일과 id 파싱
            JsonNode rootNode = objectMapper.readTree(userInfoResponse.getBody()); // readTree 사용해서 원하는 값만 추출
            JsonNode responseNode = rootNode.path("response");

            String userId = responseNode.has("id") ? responseNode.get("id").asText() : null;
            String email = responseNode.has("email") ? responseNode.get("email").asText() : null;

            // 로그 출력
            log.debug("네이버 고유 id: {}", userId);
            log.debug("네이버 이메일: {}", email);

            // TODO: 1. 네이버 info 값이 있는지 확인.
            HashMap<String, Object> map = new HashMap<>();
//            map.put("sql_key", "hrs_login");
//            map.put("login_type", "naver_select");
//            map.put("rprs_ognz_no", "WIN");
            map.put("sns_id", userId);
            map.put("sns_user", email);
            return map;


//            ArrayList<Map<String, Object>> params = new ArrayList<>();
//            params.add(map);
//
//            SswRequestSqlDTO sswRequestSqlDTO = new SswRequestSqlDTO();
//            sswRequestSqlDTO.setSqlId("hrs_login01");
//            sswRequestSqlDTO.setParams(params);
//
//            ArrayList<SswRequestSqlDTO> requestList = new ArrayList<>();
//            requestList.add(sswRequestSqlDTO);
//            log.debug("requestLIST {}" , requestList);
//
//            SswResponseDTO responseDTO = sswService.ssw0002(requestList, false);
//            log.debug("responseDTO {}", responseDTO);
//
//            if( responseDTO.getResData().get(0).getData().get(0).get("return_cd").equals("40002")){
////                ((Map)((List)responseDTO.getResData().get(0).getData().get(0).get("data")).get(0)).get("data")
//                log.debug("성공");
//                HashMap<String, Object> responseMap = new HashMap<>();
//                responseMap.put("sns_id",((Map)((List)responseDTO.getResData().get(0).getData().get(0).get("data")).get(0)).get("data").get());
//                responseMap.put("sns_user")
//
//            }



            //            log.debug("responses {}" , responses);
//            System.out.println(responses.get(0));
//            log.debug("###########################" + ((List) (responses.get(0).get("data"))).get(0));
//
//            if(( (Map) ((List)(responses.get(0).get("data"))).get(0)).get("return_cd").equals("40000")){
//                log.debug("로그인 성공");
//                Object dataObj = responses.get(0).get("data");
//
//                if (dataObj instanceof List) {
//                    List<?> dataList = (List<?>) dataObj;
//
//                    // Jackson ObjectMapper를 사용하여 JSON 배열로 변환
//                    JsonNode rootNode1 = objectMapper.valueToTree(dataList);
//                    log.debug("ognz_no",rootNode1.get(0).get("ognz_no"));
//                    log.debug("user_no",rootNode1.get(0).get("user_no"));
//                    log.debug("rprs_ognz_no",rootNode1.get(0).get("rprs_ognz_no"));
//                    log.debug("return_cd",rootNode1.get(0).get("return_cd"));
//
//                    //System.out.println(rootNode1.toPrettyString()); // JSON 형식 출력
//                    HashMap<String, Object> map1 = new HashMap<>();
//                    map1.put("ognz_no", rootNode1.get(0).get("ognz_no"));
//                    map1.put("user_no", rootNode1.get(0).get("user_no"));
//                    map1.put("rprs_ognz_no", rootNode1.get(0).get("rprs_ognz_no"));
//                    return map1;
//                } else {
//
//                }
//
//            } else {
//                log.debug("로그인 실패");
//
//            }

//            // 추후 DB 값 받아 온 걸로 변경
//            if(userId.equals("추후변경") || email.equals("khwan929@naver.com")){ // userId랑 비교하는 값 변경예정
//                log.debug("로그인 성공");
//                return SswUtils.SswResponse(Map.of("userId", userId, "email", email));
//            } else {
//                log.debug("로그인 실패");
//                SswResponseDTO res = new SswResponseDTO();
//                res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
//                res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
//                return res;
//            }
//            return null;


        } catch (URISyntaxException e) {
            log.error("error", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return null;
        } catch (JsonMappingException e) {
            log.error("error", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return null;
        } catch (JsonProcessingException e) {
            log.error("error", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return null;
        }
//        catch (ParseException e) {
//            throw new RuntimeException(e);
//        }
    }

    public SswResponseDTO saveInfo(String code, String state, String userNo, String companyCd, HttpServletResponse httpResponse) {
        log.debug("서비스 실행");
        try {
            // accessToken 요청 URI 생성
            String uriString = String.format(
                    "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=%s&client_secret=%s&code=%s&state=%s",
                    clientId, clientSecret, code, state
            );

            URI uri = new URI(uriString);
            log.debug("생성된 URI: {}", uri);

            // 1. accessToken 요청
            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

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
            String userInfoUrl = "https://openapi.naver.com/v1/nid/me";
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
            JsonNode responseNode = rootNode.path("response");
            String userId = responseNode.path("id").asText();
            String email = responseNode.path("email").asText();

            // 로그 출력
            log.debug("네이버 고유 id: {}", userId);
            log.debug("네이버 이메일: {}", email);

            // 사용자 정보 파싱
            Map<String, Object> userInfo = objectMapper.readValue(userInfoResponse.getBody(), Map.class);
            log.debug("사용자 정보: {}", userInfo);

            // TODO: 연동하기시 받아온 값을 통해서 DB에 값 저장 - email, 고유 id 값을 tsm_user에 저장 | 성공, 실패 확인까지만
            HashMap<String, Object> map = new HashMap<>();
            map.put("sql_key", "hrs_login");
            map.put("login_type", "naver_update");
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

//            httpResponse.sendRedirect(FRONT_URL + "/settings/basicSetting/loginInfo/SB001");
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
        // 알 수 없는 에러 발생
        SswResponseDTO res = new SswResponseDTO();
        res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
        res.setRtnMsg("알 수 없는 응답 코드");
        return res;
    }

}