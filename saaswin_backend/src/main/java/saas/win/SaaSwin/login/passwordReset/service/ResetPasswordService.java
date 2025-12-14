package saas.win.SaaSwin.login.passwordReset.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.aligo.dto.AligoRequestDTO;
import saas.win.SaaSwin.aligo.service.AligoService;
import saas.win.SaaSwin.keycloak.dto.KeycloakUserRequestDto;
import saas.win.SaaSwin.keycloak.service.KeycloakCreateUserService;
import saas.win.SaaSwin.keycloak.service.KeycloakPasswordService;
import saas.win.SaaSwin.login.passwordReset.dto.request.AuthCodeRequestDTO;
import saas.win.SaaSwin.login.passwordReset.dto.request.InfoCheckRequestDTO;
import saas.win.SaaSwin.login.passwordReset.dto.request.AuthenticationCheckDTO;
import saas.win.SaaSwin.login.passwordReset.dto.request.ResetPasswordRequestDTO;
import saas.win.SaaSwin.login.passwordReset.dto.response.InfoCheckResponseDTO;
import saas.win.SaaSwin.login.verification.service.SSOUserService;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.service.SswService;
import saas.win.SaaSwin.util.SHA512Util;
import saas.win.SaaSwin.util.SswUtils;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Duration;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResetPasswordService {

    private final StringRedisTemplate redisTemplate;
    private final SqlService sqlService;
    private final SswService sswService;
    private final AligoService aligoService;
    private final SSOUserService ssoUserService;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final KeycloakPasswordService keycloakPasswordService;
    private final KeycloakCreateUserService keycloakCreateUserService;
    
    // 인증번호 확인 (단순화된 버전)
    public SswResponseDTO doCheck(AuthCodeRequestDTO dto) throws ParseException {
        HashMap<String, Object> responseMap = new HashMap<>();

        String authCode = dto.getAuthCode();   // 사용자가 입력한 인증번호
        String userId = dto.getUser_id();      // 사용자 ID

        // Redis에 저장된 인증번호 조회
        String redisAuthCode = redisTemplate.opsForValue().get("password_reset_" + userId);

        if (redisAuthCode == null) {
            log.debug("Redis에서 인증번호를 찾을 수 없음: password_reset_{}", userId);
            responseMap.put("state", "fail");
            responseMap.put("message", "인증번호가 존재하지 않습니다.");
            return SswUtils.SswResponse(responseMap);
        } else {
            if (authCode.equals(redisAuthCode)) {
                log.debug("인증번호 확인 성공: 사용자={}", userId);
                responseMap.put("state", "success");
                responseMap.put("message", "인증번호가 확인되었습니다.");

                // 인증 성공 시 Redis 키 삭제
                Boolean deleteResult = redisTemplate.delete("password_reset_" + userId);
                if (Boolean.TRUE.equals(deleteResult)) {
                    log.info("Redis에서 비밀번호 재설정 인증번호 키 삭제 성공: password_reset_{}", userId);
//                    keycloakPasswordService.updatePassword()

                } else {
                    log.warn("Redis에서 비밀번호 재설정 인증번호 키 삭제 실패 또는 키가 이미 존재하지 않음: password_reset_{}", userId);
                }
            } else {
                log.debug("인증번호 불일치: 사용자={}, 입력값={}", userId, authCode);
                responseMap.put("state", "fail");
                responseMap.put("message", "인증번호가 다릅니다.");
            }
        }

        return SswUtils.SswResponse(responseMap);
    }

    public SswResponseDTO infoCheck(InfoCheckRequestDTO dto) throws ParseException {
        // TODO: 조회문을 통해서 넘어온 값들 DB에 있는지 확인
        // 함수랑 다르게 어떻게 넘기는지 배우고 진행 예정

        HashMap<String, Object> map = new HashMap<>();
//        map.put("sql_key", "hrs_login_infocheck");
        map.put("user_id", dto.getUser_id());

        ArrayList<Map<String, Object>> params = new ArrayList<>();
        params.add(map);

        SswRequestSqlDTO sswRequestSqlDTO = new SswRequestSqlDTO();
        sswRequestSqlDTO.setSqlId("hrs_login01");
        sswRequestSqlDTO.setSql_key("hrs_login_infocheck");
        sswRequestSqlDTO.setParams(params);

        ArrayList<SswRequestSqlDTO> requestList = new ArrayList<>();
        requestList.add(sswRequestSqlDTO);

        SswResponseDTO responseDTO = sswService.ssw0002(requestList, false);
        log.debug("responseDTO {}", responseDTO);

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // 간단한 null 체크 후 바로 데이터 접근
            Map<String, Object> bscInfo = (Map<String, Object>) responseDTO.getResData().get(0).getData().get(0).get("bsc_info");
            // 사용자 정보와 입력값 비교
            if (bscInfo != null &&
                    bscInfo.get("telno") != null &&
                    bscInfo.get("brdt") != null &&
                    dto.getTelno().equals(bscInfo.get("telno")) &&
                    dto.getBrdt().equals(bscInfo.get("brdt"))) {

                // 6자리 인증번호 생성
                SecureRandom random = new SecureRandom();
                int number = random.nextInt(1000000);
                String authCode = String.format("%06d", number);


                // Redis에 저장 (키 형태 통일: password_reset_ prefix 사용)
                redisTemplate.opsForValue().set("password_reset_" + dto.getUser_id(), authCode, Duration.ofMinutes(5));

                // 사용자 번호 조회
                //String userNo = responseDTO.getResData().get(0).getData().get(0).get("user_no").toString();
                String userNo = ((Map)responseDTO.getResData().get(0).getData().get(0).get("bsc_info")).get("user_no").toString();
                log.debug("userNo1111: {}", userNo);

                // 알리고 서비스로 인증번호 발송
                try {
                    log.info("비밀번호 재설정 인증번호 발송 시작 - 사용자: {}, user_no: {}", dto.getUser_id(), userNo);

                    AligoRequestDTO aligoRequest = new AligoRequestDTO();
                    aligoRequest.setNt_tmplt("TY_4521"); // 비밀번호 재설정용 템플릿

                    List<Map<String, String>> aligoParams = new ArrayList<>();
                    Map<String, String> userParam = new HashMap<>();
                    userParam.put("user_no", userNo);
                    userParam.put("rePswd_no", authCode);
                    aligoParams.add(userParam);
                    aligoRequest.setParams(aligoParams);

                    List<AligoRequestDTO> aligoRequestList = new ArrayList<>();
                    aligoRequestList.add(aligoRequest);

                    // 알림톡 발송
                    SswResponseDTO aligoResponse = aligoService.sendAligoTalk(aligoRequestList);
                    System.out.println("###########" + aligoResponse);
                    log.debug("알리고 응답 전체: {}", aligoResponse);
                    if (aligoResponse != null && SswConstants.RESULT_CODE_SUCCESS.equals(aligoResponse.getRtnCode())) {
                        log.info("비밀번호 재설정 인증번호 알림톡 전송 성공 - 사용자: {}", dto.getUser_id());
                        responseMap.put("result", "success");
                        responseMap.put("return_cd", "40002");
                        responseMap.put("authentication", "인증번호가 카카오톡으로 전송되었습니다.");
                    } else {
                        log.warn("비밀번호 재설정 인증번호 알림톡 전송 실패 - 사용자: {}, 응답: {}", dto.getUser_id(), aligoResponse);
                        responseMap.put("result", "fail");
                        responseMap.put("return_cd", "50006");
                        responseMap.put("authentication", "인증번호 전송에 실패했습니다. 다시 시도해주세요.");
                    }
                } catch (Exception e) {
                    log.error("비밀번호 재설정 인증번호 알림톡 전송 중 오류 발생 - 사용자: {}", dto.getUser_id(), e);
                    responseMap.put("result", "fail");
                    responseMap.put("return_cd", "50006");
                    responseMap.put("authentication", "인증번호 전송 중 오류가 발생했습니다.");
                }

            } else {
                log.debug("사용자 정보 불일치 - 핸드폰: {}, 생년월일: {}", dto.getTelno(), dto.getBrdt());
                responseMap.put("result", "fail");
                responseMap.put("return_cd", "50006");
                responseMap.put("authentication", "입력하신 정보가 일치하지 않습니다.");
            }
        } catch (Exception e) {
            log.error("정보 확인 중 오류 발생: ", e);
            responseMap.put("result", "fail");
            responseMap.put("return_cd", "50006");
            responseMap.put("authentication", "사용자 정보를 확인하는 중 오류가 발생했습니다.");
        }

        return SswUtils.SswResponse(responseMap);
    }

    public SswResponseDTO authenticationCheck(AuthenticationCheckDTO dto) {
        try {

        Map<String, Object> param = SswUtils.convertDTOToMap(dto);
        Map<String, Object> wrappedMap = new HashMap<>();
        wrappedMap.put("param_data", param);

        ArrayList<Map<String, Object>> params = new ArrayList<>();
        params.add(wrappedMap);

        SswRequestSqlDTO sswRequestSqlDTO = new SswRequestSqlDTO();
        sswRequestSqlDTO.setSqlId(SqlConstants.PASSWORD_RESET_ID_02);
        sswRequestSqlDTO.setParams(params);

        List<Map<String, Object>> response = sqlService.executeQuery_select(sswRequestSqlDTO);
        log.debug("response: {}",response);

        HashMap<String, Object> map = new HashMap<>();

        if(((Map) response.get(0).get("data")).get("return_cd").equals("40000")) {
            log.debug("비밀번호 초기화 성공");
            map.put("data", "succes");

        } else {
            log.debug("비밀번호 초기화 실패");
            map.put("data", "fail");
        }

        // 6자리 랜덤 숫자 생성
        String state = String.format("%06d", Math.abs(UUID.randomUUID().hashCode()) % 1000000);

        redisTemplate.opsForValue().set("initialCode_" + state, "valid", Duration.ofMinutes(5));

        log.debug("state: {}", state);

        return SswUtils.SswResponse(map);

        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

    }

    public SswResponseDTO updatePassword(Map<String, Object> dto) {
        HashMap<String, Object> map = new HashMap<>();
        String sqlId = SqlConstants.REDIS_SQL_LOGIN_01;
        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(sqlId);
        sqlDto.setSql_key(SqlConstants.REDIS_SQL_LOGIN_KEY_01);
        // user_no와 encrypt_pswd 꺼내기
        String userNo = (String) dto.get("user_no");
        String rprsOngzNo = (String) dto.get("rprs_ognz_no");
        String user_id = (String) dto.get("user_id");
        Map<String, Object> encryptPswd = (Map<String, Object>) dto.get("encrypt_pswd");

        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("user_no", userNo);
        paramMap.put("rprs_ognz_no", rprsOngzNo);
        paramMap.put("encrypt_pswd", encryptPswd);

        List<Map<String, Object>> params = new ArrayList<>();
        params.add(paramMap);
        sqlDto.setParams(params);

        if (userNo != null && userNo.trim().length() > 0 &&
                rprsOngzNo != null && rprsOngzNo.trim().length() > 0 &&
                encryptPswd != null && !encryptPswd.isEmpty() &&
                encryptPswd.get("encryptedData") != null &&
                !encryptPswd.get("encryptedData").toString().trim().isEmpty()) {


            try {
                // 업무 DB 저장
                List<Map<String, Object>> findMidList = sqlService.executeQuery_select_for_func(sqlDto);

                // 중첩 구조에서 함수 결과 직접 추출
                Map<String, Object> functionResult = null;
                Object current = findMidList;

                // 여러 레벨의 중첩을 탐색
                while (current != null) {
                    if (current instanceof List) {
                        List<?> list = (List<?>) current;
                        if (!list.isEmpty()) {
                            current = list.get(0);
                        } else {
                            break;
                        }
                    } else if (current instanceof Map) {
                        Map<String, Object> currentMap = (Map<String, Object>) current;

                        // saaswin_hrs_login_chg_pswd 키가 있다면 그 값을 가져옴
                        if (currentMap.containsKey("saaswin_hrs_login_chg_pswd")) {
                            functionResult = (Map<String, Object>) currentMap.get("saaswin_hrs_login_chg_pswd");

                            break;
                        }

                        // data 키가 있다면 계속 탐색
                        if (currentMap.containsKey("data")) {
                            current = currentMap.get("data");
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                if (functionResult != null && "40002".equals(functionResult.get("return_cd"))) {
                    // plaintext 추출
                    String plaintext = (String) functionResult.get("plaintext");
                    String sha_pswd = SHA512Util.hashSHA512(plaintext);
                    String returnCd = (String) functionResult.get("return_cd");

                    // 응답용 데이터 생성 (plaintext 제거)
                    Map<String, Object> responseData = new HashMap<>(functionResult);
                    responseData.remove("plaintext");
//String returnCd = (String)responseData.get("return_cd");
                    // 먼저 응답 데이터 설정
                    map.put("data", responseData);

                    // SSO 업데이트는 별도로 처리 (실패해도 전체 응답에 영향 없음)
                    if (("40002".equals(returnCd) && plaintext != null && !plaintext.trim().isEmpty())) {
                        try {
                            ssoUserService.SSODBUserUpdated(user_id, rprsOngzNo, sha_pswd);
                            System.out.println("SSO 업데이트 성공");
                            KeycloakUserRequestDto kcDto = new KeycloakUserRequestDto();
                            kcDto.setUsername(user_id);
                            kcDto.setEmail((String) dto.get("email")); // 필요 시 dto에서 이메일 꺼냄
                            kcDto.setPassword(plaintext);

                            keycloakCreateUserService.bulkUpdateUsers(
                                rprsOngzNo, // realm 매핑 유틸
                                List.of(kcDto)
                            );
                        } catch (Exception ssoException) {
                            System.out.println("SSO 업데이트 실패하지만 계속 진행: " + ssoException.getMessage());
                            // SSO 업데이트 실패는 로그만 남기고 전체 프로세스는 성공으로 처리
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                map.put("state", "error");
                map.put("message", "데이터베이스 처리 중 오류가 발생했습니다: " + e.getMessage());
            }
        } else {
            map.put("state", "error");
            map.put("message", "사용자 번호와 암호화된 비밀번호는 필수입니다.");
        }
        return SswUtils.SswResponse(map);
    }
}
