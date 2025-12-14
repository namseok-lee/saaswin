package saas.win.SaaSwin.login.verification.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;

@Slf4j
@RequiredArgsConstructor
@Service
public class SSOUserService {
    
    // SqlService 추가
    private final SqlService sqlService;
    
    @Autowired
    @Qualifier("namedParameterJdbcTemplate")  // 메인 DB 템플릿
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Value("${sso.api.url}")
    private String ssoApiUrl;

    /**
     * 메인 DB에서 사용자 정보를 조회하여 SSO DB의 TSM_USER 테이블에 저장
     */
    public void saveTsmUser(List<Map<String, String>> userPasswordInfoList, String realm) {
        log.info("=== 메인 DB에서 사용자 정보 조회 후 SSO DB 저장 시작 ===");
        log.info("Keycloak 등록된 사용자 수: {}, Realm: {}", userPasswordInfoList.size(), realm);

        try {
            // 사용자 조회
            SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
            sqlDto.setSqlId(SqlConstants.REDIS_SQL_LOGIN_01);  // 함수명
            sqlDto.setSql_key(SqlConstants.REDIS_SQL_SSO_KEY_01);  // redis_sql의 sql_key

            // 파라미터 생성 - List를 콤마로 구분된 문자열로 변환
            Map<String, Object> paramMap = new HashMap<>();
            // Stream 대신 전통적인 방법으로
            List<String> usernames = new ArrayList<>();
            for (Map<String, String> userInfo : userPasswordInfoList) {
                usernames.add(userInfo.get("username"));
            }
            String userIdsString = String.join(",", usernames); 

            paramMap.put("userIds", userIdsString);  // 콤마 구분 문자열로 전달
            paramMap.put("rprs_ognz_no", realm);

            List<Map<String, Object>> params = new ArrayList<>();
            params.add(paramMap);
            sqlDto.setParams(params);

            log.debug("함수 호출 파라미터: {}", paramMap);

            // SqlService의 executeQuery_select_for_func 호출
            List<Map<String, Object>> functionResult = sqlService.executeQuery_select_for_func(sqlDto);

            // 함수 호출 결과에서 실제 사용자 데이터 추출
            List<Map<String, Object>> savedUsers = new ArrayList<>();

            if (!functionResult.isEmpty()) {
                // 함수 결과는 보통 data 필드에 들어있거나 직접 반환됨
                for (Map<String, Object> result : functionResult) {
                    if (result.containsKey("data")) {
                        Object dataObj = result.get("data");
                        if (dataObj instanceof List) {
                            savedUsers = (List<Map<String, Object>>) dataObj;
                        } else if (dataObj instanceof Map) {
                            savedUsers.add((Map<String, Object>) dataObj);
                        }
                        break;
                    } else {
                        // data 필드가 없으면 결과 자체가 사용자 데이터
                        savedUsers = functionResult;
                        break;
                    }
                }
            }

            log.info("메인 DB에서 조회된 사용자 수: {}", savedUsers.size());

            if (!savedUsers.isEmpty()) {
                // SSO DB 저장용 데이터 준비

                List<Map<String, Object>> dataList =
                        (List<Map<String,Object>>) savedUsers.get(0).get("data");

                List<Map<String, Object>> ssoUserDataList = new ArrayList<>();
                for (Map<String, Object> realUserInfo : dataList) {
                    Map<String, Object> ssoUserData = new HashMap<>();
                    ssoUserData.put("user_no",      realUserInfo.get("user_no"));
                    ssoUserData.put("user_id",      realUserInfo.get("user_id"));
                    ssoUserData.put("rprs_ognz_no", realUserInfo.get("rprs_ognz_no"));
                    ssoUserData.put("pswd",         realUserInfo.get("pswd"));

                    ssoUserDataList.add(ssoUserData);

                    log.info("준비된 SSO 데이터: user_no={}, user_id={}",
                            realUserInfo.get("user_no"),
                            realUserInfo.get("user_id"));
                }

                // SSO DB에 배치 저장
                saveTsmUsersBatchWithUserNo(ssoUserDataList);
                log.info("✅ 모든 사용자 SSO DB 저장 완료");
            } else {
                log.warn("⚠️ 메인 DB에서 조회된 사용자가 없습니다. Keycloak 사용자: {}", userPasswordInfoList);
            }

        } catch (Exception e) {
            log.error("❌ 사용자 정보 조회 또는 SSO DB 저장 실패: {}", e.getMessage(), e);
            throw new RuntimeException("사용자 정보 조회 또는 SSO DB 저장 실패", e);
        }
    }

    private void saveTsmUsersBatchWithUserNo(List<Map<String, Object>> ssoUserDataList) {
        log.info("=== SSO API 호출을 통한 배치 저장 시작 ===");
        log.info("저장할 사용자 수: {}", ssoUserDataList.size());

        if (ssoUserDataList.isEmpty()) {
            log.info("저장할 사용자가 없습니다.");
            return;
        }

        try {
            // [1] params 배열을 "user당 1건씩 평탄화" 구조로 생성
            Map<String, Object> wrapper = new HashMap<>();
            wrapper.put("sso_user_data_list", ssoUserDataList);
            List<Map<String, Object>> params = Collections.singletonList(wrapper);

            // [2] apiRequest 세팅
            Map<String, Object> apiRequest = new HashMap<>();
            apiRequest.put("sqlId", "sso");
            apiRequest.put("sql_key", "create");
            apiRequest.put("params", params);

            // [3] 최종 request list 생성
            List<Map<String, Object>> apiRequestList = new ArrayList<>();
            apiRequestList.add(apiRequest);


            // [4] HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // [5] HTTP 요청 엔티티 생성
            HttpEntity<List<Map<String, Object>>> requestEntity = new HttpEntity<>(apiRequestList, headers);

            // [6] RestTemplate POST 호출
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<SswResponseDTO> response = restTemplate.exchange(
                ssoApiUrl,
                HttpMethod.POST,
                requestEntity,
                SswResponseDTO.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                SswResponseDTO responseBody = response.getBody();
                if (responseBody == null) {
                    log.warn("⚠️ SSO API 응답이 비어있습니다.");
                    return;
                }
                List<SswResponseDataDTO> resultList = responseBody.getResData();
                String rtnCode = responseBody.getRtnCode();
                String rtnMsg = responseBody.getRtnMsg();

                log.info("✅ SSO API 호출 성공: rtnCode={}, rtnMsg={}", rtnCode, rtnMsg);

                // 응답 결과 분석
                if (resultList != null && !resultList.isEmpty()) {
                    for (SswResponseDataDTO result : resultList) {
                        log.info("🔎 sqlId: {}", result.getSqlId());
                        log.info("🔎 data: {}", result.getData());
                        log.info("🔎 rntRowCnt: {}", result.getRntRowCnt());
                        // 필요시 각 data의 값도 꺼내서 사용할 수 있음
                    }

                    if (!"40002".equals(rtnCode)) {
                        log.warn("⚠️ SSO 저장 결과가 예상과 다릅니다. 확인이 필요합니다.");
                    }
                } else {
                    log.warn("⚠️ resData(resultList)가 비어있습니다.");
                }

            } else {
                log.error("❌ SSO API 호출 실패: HTTP {}", response.getStatusCode());
                throw new RuntimeException("SSO API 호출 실패: HTTP " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("❌ SSO API 호출 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("SSO API 호출 실패", e);
        }
    }

    public void SSODBUserUpdated(String user_id, String rprsOgnzNo, String pswd) {
        try {
            // API 요청 데이터 구성
            List<Map<String, Object>> apiRequestList = new ArrayList<>();

            // 단일 요청 객체 생성
            Map<String, Object> apiRequest = new HashMap<>();
            apiRequest.put("sqlId", "sso");
            apiRequest.put("sql_key", "update");

            // params 배열 생성
            List<Map<String, Object>> params = new ArrayList<>();
            Map<String, Object> param = new HashMap<>();
            param.put("user_id", user_id);
            param.put("rprsOgnzNo", rprsOgnzNo);
            param.put("pswd", pswd);
            params.add(param);
            apiRequest.put("params", params);

            // 최종 배열에 추가
            apiRequestList.add(apiRequest);

            log.debug("SSO API 요청 데이터: {}", apiRequestList);

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // HTTP 요청 엔티티 생성
            HttpEntity<List<Map<String, Object>>> requestEntity = new HttpEntity<>(apiRequestList, headers);

            // RestTemplate POST 호출
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<List> response = restTemplate.exchange(
                ssoApiUrl,
                HttpMethod.POST,
                requestEntity,
                List.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                List<Map<String, Object>> responseBody = response.getBody();
                log.info("✅ SSO API 호출 성공: {}", responseBody);

                // 응답 결과 분석
                if (responseBody != null && !responseBody.isEmpty()) {
                    Map<String, Object> result = responseBody.get(0);
                    String returnCode = (String) result.get("return_cd");
                    String message = (String) result.get("message");
                    Integer totalInserted = (Integer) result.get("total_inserted");
                    Integer totalSkipped = (Integer) result.get("total_skipped");

                    log.info("📊 SSO 저장 결과:");
                    log.info("  - 반환 코드: {}", returnCode);
                    log.info("  - 메시지: {}", message);
                    log.info("  - 저장된 사용자: {}명", totalInserted);
                    log.info("  - 건너뛴 사용자: {}명", totalSkipped);

                    if (!"40002".equals(returnCode)) {
                        log.warn("⚠️ SSO 저장 결과가 예상과 다릅니다. 확인이 필요합니다.");
                    }
                } else {
                    log.warn("⚠️ SSO API 응답이 비어있습니다.");
                }

            } else {
                log.error("❌ SSO API 호출 실패: HTTP {}", response.getStatusCode());
                throw new RuntimeException("SSO API 호출 실패: HTTP " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("❌ SSO API 호출 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("SSO API 호출 실패", e);
        }
    }
}