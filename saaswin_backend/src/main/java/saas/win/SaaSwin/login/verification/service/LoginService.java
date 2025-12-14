package saas.win.SaaSwin.login.verification.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.keycloak.dto.KeycloakUserRequestDto;
import saas.win.SaaSwin.keycloak.service.KeycloakCreateUserService;
import saas.win.SaaSwin.login.verification.dto.request.LoginRequestDTO;
import saas.win.SaaSwin.login.verification.dto.response.LoginResponseDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.util.PasswordGenerator;
import saas.win.SaaSwin.util.SHA512Util;
import saas.win.SaaSwin.util.SswUtils;

import java.sql.SQLException;
import java.text.ParseException;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class LoginService {

    private final SqlService sqlService;
    private final KeycloakCreateUserService keycloakCreateUserService;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final SSOUserService ssoUserService;

    @Transactional
    public SswResponseDTO login(@RequestBody LoginRequestDTO dto) throws ParseException, SQLException {
        // 1. dto를 Map<String, Object> 형태로 변환
        Map<String, Object> paramMap = SswUtils.convertDTOToMap(dto);

        // 2. param_data 안에 dto의 데이터를 넣음
        Map<String, Object> wrappedParam = new HashMap<>();
        wrappedParam.put("param_data", paramMap);

        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();;
//        params.add(SswUtils.convertDTOToMap(dto));
        params.add(wrappedParam);
//        SswUtils.convertDTOToMap(dto);
        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(SqlConstants.LOGIN_SQL_ID_01);
        sqlDto.setParams(params);
        log.debug("전달되는 JSONB 값: " + new Gson().toJson(dto));
        log.debug("SQL 실행 전 params 값: " + new Gson().toJson(params));
        List<Map<String, Object>> loginInfos = sqlService.executeQuery_select(sqlDto);

        // 결과값 매핑
        LoginResponseDTO result = new LoginResponseDTO();
        HashMap<String, Object> map = new HashMap<>();

        if((((Map)loginInfos.get(0).get("data")).containsKey("return_cd"))){
            if((((Map)loginInfos.get(0).get("data")).get("return_cd")).equals("40003")) {
                log.debug("로그인 실패");
                result.setAccessToken(null);
                map.put("data", result);
                return SswUtils.SswResponse(map);
            }
        }

        log.debug("loginInfos : " + loginInfos.get(0).get("data"));
        log.debug("loginInfos : " + ((Map)loginInfos.get(0).get("data")).get("return_cd"));

        for(Map<String, Object> loginInfo : loginInfos) {
            loginInfo.get("user_no");
//            result.setUser_no(dto.getUser_no());
            log.debug("loginInfo : " + loginInfo);

            result = SswUtils.convertMapToDTO( (Map<String, Object>) loginInfo.get("data"), LoginResponseDTO.class);
            result.setAccessToken("temp_success");
            log.debug("result값 출력: " + result.toString());
            log.debug("로그인 성공");
        }

        map.put("data", result);

        return SswUtils.SswResponse(map);
    }

    public List<Map<String, Object>> findRprsOgnzNo(String userId) throws ParseException, SQLException {
        try {
            String sqlQuery = "SELECT * FROM tsm_user WHERE user_id = :user_id";

            Map<String, Object> params = new HashMap<>();
            params.put("user_id", userId);

            log.info("SQL 실행: {}, 파라미터: {}", sqlQuery, params);

            List<Map<String, Object>> result = namedParameterJdbcTemplate.queryForList(sqlQuery, params);

            log.info("조회 결과 건수: {}", result.size());

            return result;

        } catch (Exception e) {
            log.error("사용자 조회 중 오류 발생: {}", e.getMessage());
            throw e;
        }
    }

    public List<Map<String, Object>> createUser(List<Map<String, Object>> dto) throws ParseException, SQLException {
        long totalStartTime = System.currentTimeMillis();
        System.out.println("===== createUser 메소드 시작 =====");
        
        // TABLE을 반환하는 함수는 SELECT * FROM 또는 SELECT 컬럼명 FROM으로 호출해야 함
        SswRequestSqlDTO hpr_invtn_trpr_grid_cudDTO = new SswRequestSqlDTO();
        List<Map<String, Object>> cudParamsList = new ArrayList<>();
    
        hpr_invtn_trpr_grid_cudDTO.setSqlId(SqlConstants.REDIS_SQL_INVTN_01);
        hpr_invtn_trpr_grid_cudDTO.setSql_key(SqlConstants.REDIS_SQL_INVTN_KEY_01);
    
        Map<String, Object> params = new HashMap<>();
        if (!dto.isEmpty() && dto.get(0).containsKey("params")) {
            Object paramsValue = dto.get(0).get("params");
            if (paramsValue instanceof List) {
                // ArrayList인 경우, 첫 번째 요소를 가져와서 처리
                List<Object> paramsList = (List<Object>) paramsValue;
                if (!paramsList.isEmpty() && paramsList.get(0) instanceof Map) {
                    params.putAll((Map<String, Object>) paramsList.get(0));
                }
            } else if (paramsValue instanceof Map) {
                params.putAll((Map<String, Object>) paramsValue);
            }
        }
    
        cudParamsList.add(params);
        hpr_invtn_trpr_grid_cudDTO.setParams(cudParamsList);
        String realm = (String) params.get("rprs_ognz_no");
        List<Map<String, Object>> finalResult = new ArrayList<>();
    
        // 각 사용자별 비밀번호 정보를 저장할 리스트
        List<Map<String, String>> userPasswordInfoList = new ArrayList<>();
        List<KeycloakUserRequestDto> keycloakDtoList = new ArrayList<>();
        Object trprInfoObj = params.get("trpr_info");
        
        // ===== 1. 비밀번호 생성 구간 =====
        long passwordGenStartTime = System.currentTimeMillis();
        System.out.println("1. 비밀번호 생성 시작");
        
        if (trprInfoObj instanceof List) {
            List<Object> trprInfoList = (List<Object>) trprInfoObj;
    
            // 각 사용자마다 고유한 임시 비밀번호 생성 (Java에서 직접 처리)
            for (Object trprItem : trprInfoList) {
                if (trprItem instanceof Map) {
                    Map<String, Object> trprMap = (Map<String, Object>) trprItem;
                    String username = (String) trprMap.get("eml");
    
                    if (username != null) {
                        // Java에서 직접 18자리 랜덤 비밀번호 생성 (DB 호출 제거)
                        String rawText = PasswordGenerator.generateRandomPassword(18);
                        String sha512Hash = SHA512Util.hashSHA512(rawText);
    
                        // 사용자별 비밀번호 정보 저장
                        Map<String, String> userPasswordInfo = new HashMap<>();
                        userPasswordInfo.put("username", username);
                        userPasswordInfo.put("rawText", rawText);
                        userPasswordInfo.put("sha512Hash", sha512Hash);
                        userPasswordInfoList.add(userPasswordInfo);
    
                        // 현재 사용자의 비밀번호 정보를 trprMap에 추가
                        trprMap.put("tmp_raw_text", rawText);
                        trprMap.put("tmp_sha512_hash", sha512Hash);
    
                        // KeycloakUserRequestDto 생성 및 설정
                        KeycloakUserRequestDto keycloakDto = new KeycloakUserRequestDto();
                        keycloakDto.setUsername(username);
                        keycloakDto.setRealm(realm);
                        keycloakDto.setPassword(rawText);
                        keycloakDtoList.add(keycloakDto);
                    }
                }
            }
    
            // 업데이트된 trpr_info를 params에 다시 설정
            params.put("trpr_info", trprInfoList);
        }
        
        long passwordGenEndTime = System.currentTimeMillis();
        System.out.println("1. 비밀번호 생성 완료 - 소요시간: " + (passwordGenEndTime - passwordGenStartTime) + "ms");
        System.out.println("   생성된 사용자 수: " + userPasswordInfoList.size());
        
        // ===== 2. Keycloak 사용자 등록 구간 =====
        long keycloakStartTime = System.currentTimeMillis();
        System.out.println("2. Keycloak 사용자 등록 시작");
        
        try {
            if (!keycloakDtoList.isEmpty()) {
                keycloakCreateUserService.bulkRegisterUsers(realm, keycloakDtoList);
            }
        } catch (Exception e) {
            System.err.println("Keycloak bulk 등록 실패");
            e.printStackTrace();
        }
        
        long keycloakEndTime = System.currentTimeMillis();
        System.out.println("2. Keycloak 사용자 등록 완료 - 소요시간: " + (keycloakEndTime - keycloakStartTime) + "ms");
        
        // ===== 3. 업무 DB 저장 구간 =====
        long businessDbStartTime = System.currentTimeMillis();
        System.out.println("3. 업무 DB 저장 시작");
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> findMidList = sqlService.executeQuery_select_for_func(hpr_invtn_trpr_grid_cudDTO);
    
            if (!findMidList.isEmpty()) {
                Map<String, Object> result = findMidList.get(0);
                Map<String, Object> data = (Map<String, Object>) result.get("data");
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) data.get("data");
                Map<String, Object> resultMap = dataList.get(0);
    
                // 모든 키 확인
                System.out.println("Available keys: " + resultMap.keySet());
    
                // 각 키의 값 확인
                for (Map.Entry<String, Object> entry : resultMap.entrySet()) {
                    System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue() + ", Type: " + (entry.getValue() != null ? entry.getValue().getClass() : "null"));
                }
    
                // 가능한 키들로 시도
                String jsonResult = null;
                Object resultValue = null;
                if (resultMap.containsKey("result")) {
                    resultValue = resultMap.get("result");
                } else if (resultMap.containsKey("saaswin_hpr_invtn_trpr_grid_cud")) {
                    resultValue = ((Map)resultMap.get("saaswin_hpr_invtn_trpr_grid_cud"));
                } else {
                    resultValue = resultMap.values().iterator().next();
                }
    
                // resultValue 직렬화
                if (resultValue != null) {
                    if (resultValue instanceof Map || resultValue instanceof List) {
                        jsonResult = objectMapper.writeValueAsString(resultValue);
                    } else {
                        jsonResult = resultValue.toString();
                    }
                }
    
                System.out.println("JSON Result: " + jsonResult);
    
                if (jsonResult != null && !jsonResult.isEmpty()) {
                    // JSON 배열을 List<Map>으로 파싱 (수정된 부분)
                    if (jsonResult.startsWith("[")) {
                        // 배열인 경우
                        List<Map<String, Object>> parsedResultList = objectMapper.readValue(jsonResult, 
                            new TypeReference<List<Map<String, Object>>>() {});
                        finalResult.addAll(parsedResultList);
                    } else {
                        // 단일 객체인 경우
                        Map<String, Object> parsedResult = objectMapper.readValue(jsonResult, Map.class);
                        finalResult.add(parsedResult);
                    }
                }
            }
    
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("JSON 변환 오류", e);
        }
        
        long businessDbEndTime = System.currentTimeMillis();
        System.out.println("3. 업무 DB 저장 완료 - 소요시간: " + (businessDbEndTime - businessDbStartTime) + "ms");
    
        // ===== 4. SSO DB 저장 구간 =====
        long ssoDbStartTime = System.currentTimeMillis();
        System.out.println("4. SSO DB 저장 시작");
        
        if (!userPasswordInfoList.isEmpty()) {
            try {
                ssoUserService.saveTsmUser(userPasswordInfoList, realm);
            } catch (Exception e) {
                System.err.println("SSO DB 저장 중 예외 발생:");
                System.err.println("Exception type: " + e.getClass().getName());
                System.err.println("Exception message: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        long ssoDbEndTime = System.currentTimeMillis();
        System.out.println("4. SSO DB 저장 완료 - 소요시간: " + (ssoDbEndTime - ssoDbStartTime) + "ms");
    
        // ===== 전체 시간 출력 =====
        long totalEndTime = System.currentTimeMillis();
        long totalTime = totalEndTime - totalStartTime;
        System.out.println("===== createUser 메소드 완료 =====");
        System.out.println("전체 소요시간: " + totalTime + "ms (" + (totalTime / 1000.0) + "초)");
        System.out.println("구간별 소요시간:");
        System.out.println("  1. 비밀번호 생성: " + (passwordGenEndTime - passwordGenStartTime) + "ms");
        System.out.println("  2. Keycloak 등록: " + (keycloakEndTime - keycloakStartTime) + "ms");
        System.out.println("  3. 업무 DB 저장: " + (businessDbEndTime - businessDbStartTime) + "ms");
        System.out.println("  4. SSO DB 저장: " + (ssoDbEndTime - ssoDbStartTime) + "ms");
    
        return finalResult;
    }
}
