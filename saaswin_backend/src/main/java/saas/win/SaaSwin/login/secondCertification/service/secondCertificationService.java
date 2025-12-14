package saas.win.SaaSwin.login.secondCertification.service;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.aligo.dto.AligoRequestDTO;
import saas.win.SaaSwin.aligo.service.AligoService;
import saas.win.SaaSwin.login.secondCertification.dto.SecondCertificationRequestDTO;
import saas.win.SaaSwin.login.secondCertification.dto.SecondCertificationResponseDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.service.SswService;
import lombok.RequiredArgsConstructor;

@Slf4j
@RequiredArgsConstructor
@Service    
public class secondCertificationService {

    private final StringRedisTemplate redisTemplate;
    private final SswService sswService;
    private final AligoService aligoService;

    // 인증번호 발송
    public SecondCertificationResponseDTO sendCertification(SecondCertificationRequestDTO requestDto) throws ParseException {

        SecondCertificationResponseDTO responseDto = new SecondCertificationResponseDTO();

        // 핸드폰번호 비교
        String tel_no = requestDto.getTel_no();
        HashMap<String, Object> map = new HashMap<>();

        // 사용자 id로 사용자 번호와 모바일번호 조회
        map.put("sql_key", "hrs_login_infocheck");
        map.put("user_id", requestDto.getUserid());

        ArrayList<Map<String, Object>> params = new ArrayList<>();
        params.add(map);

        SswRequestSqlDTO sswRequestSqlDTO = new SswRequestSqlDTO();
        sswRequestSqlDTO.setSqlId("hrs_login01");
        sswRequestSqlDTO.setParams(params);

        ArrayList<SswRequestSqlDTO> requestList = new ArrayList<>();
        requestList.add(sswRequestSqlDTO);

        SswResponseDTO sswResponseDTO = sswService.ssw0002(requestList, false);

        Map bscInfoMap = (Map) ((Map) sswResponseDTO.getResData().get(0).getData().get(0)).get("bsc_info");
        if (bscInfoMap != null && tel_no.equals(bscInfoMap.get("telno"))) {
            String userNo = bscInfoMap.get("user_no").toString();
            // 인증번호
            SecureRandom random = new SecureRandom();
            int number = random.nextInt(1000000);
            String authCode = String.format("%06d", number);

            // 인증번호 레디스에 user_id로 저장
            redisTemplate.opsForValue().set("certification_"+ requestDto.getUserid(), authCode, Duration.ofMinutes(3));

            try {
                log.info("핸드폰 번호 일치, 사용자 (user_no: '{}')에게 알림톡(TZ_8650) 전송 시도.", userNo);
                AligoRequestDTO aligoRequest = new AligoRequestDTO();
                aligoRequest.setNt_tmplt("TZ_8650");

                List<Map<String, String>> aligoParams = new ArrayList<>();
                Map<String, String> userParam = new HashMap<>();
                userParam.put("user_no", userNo); // 조회된 user_no 사용
                userParam.put("cert_no", authCode); // 생성된 인증 번호 추가
                aligoParams.add(userParam);
                aligoRequest.setParams(aligoParams);

                List<AligoRequestDTO> aligoRequestList = new ArrayList<>();
                aligoRequestList.add(aligoRequest);

                // 알림톡 발송
                SswResponseDTO aligoResponse = aligoService.sendAligoTalk(aligoRequestList);

                if (aligoResponse != null && SswConstants.RESULT_CODE_SUCCESS.equals(aligoResponse.getRtnCode())) {
                    log.info("사용자 (user_no: '{}')에게 알림톡(TZ_8650) 전송 성공.", userNo);
                    responseDto.setReturnCd("40002");
                    responseDto.setReturnMsg("인증코드가 전송되었습니다.");
                } else {
                    log.warn("사용자 (user_no: '{}')에게 알림톡(TZ_8650) 전송 실패. 응답: {}", userNo, aligoResponse);
                    responseDto.setReturnCd("50006");
                    responseDto.setReturnMsg("알림톡 전송실패하였습니다.");
                }
            } catch (Exception e) {
                log.error("사용자 (user_no: '{}')에게 알림톡(TZ_8650) 전송 중 오류 발생", userNo, e);
                responseDto.setReturnCd("50006");
                responseDto.setReturnMsg("알림톡 전송 중 오류가 발생했습니다.");
            }
           
        } else {
            responseDto.setReturnCd("40004");
            responseDto.setReturnMsg("핸드폰 번호가 일치하지 않습니다.");
        }

        

        return responseDto;
    }

    
    // 인증번호 확인
    public SecondCertificationResponseDTO checkCertification(SecondCertificationRequestDTO requestDto) throws ParseException {
        SecondCertificationResponseDTO responseDto = new SecondCertificationResponseDTO();
        
        String cert_no = requestDto.getCert_no();   //사용자가 입력한 인증번호
        String userid = requestDto.getUserid();
        
        // 디버깅 로그 추가
        log.info("=== 인증번호 확인 시작 ===");
        log.info("요청 userid: '{}'", userid);
        log.info("요청 cert_no: '{}'", cert_no);
        log.info("Redis 키: '{}'", "certification_" + userid);
        
        // Redis 연결 상태 확인
        try {
            String pingResult = redisTemplate.getConnectionFactory().getConnection().ping();
            log.info("Redis 연결 상태: {}", pingResult);
        } catch (Exception e) {
            log.error("Redis 연결 확인 중 오류", e);
        }
        
        // Redis에 해당 키가 존재하는지 먼저 확인
        String redisKey = "certification_" + userid;
        Boolean keyExists = redisTemplate.hasKey(redisKey);
        log.info("Redis 키 존재 여부: {}", keyExists);
        
        // Redis에 저장된 모든 키 패턴 확인 (certification_으로 시작하는 키들)
        try {
            Set<String> certificationKeys = redisTemplate.keys("certification_*");
            log.info("Redis에 저장된 certification_ 키들: {}", certificationKeys);
            if (certificationKeys != null && !certificationKeys.isEmpty()) {
                for (String key : certificationKeys) {
                    String value = redisTemplate.opsForValue().get(key);
                    log.info("키: '{}', 값: '{}'", key, value);
                }
            }
        } catch (Exception e) {
            log.error("Redis 키 목록 조회 중 오류", e);
        }
        
        // 레디스에 저장된 인증번호
        String RedisCertNo = null;
        try {
            RedisCertNo = redisTemplate.opsForValue().get(redisKey);
            log.info("Redis에서 조회된 값: '{}'", RedisCertNo);
        } catch (Exception e) {
            log.error("Redis에서 값 조회 중 오류", e);
            responseDto.setReturnCd("50005");
            responseDto.setReturnMsg("시스템 오류가 발생했습니다.");
            return responseDto;
        }
        
        // TTL 확인 (키가 존재하지만 값이 null인 경우를 위해)
        if (keyExists) {
            try {
                Long ttl = redisTemplate.getExpire(redisKey);
                log.info("키 '{}' TTL: {} 초", redisKey, ttl);
            } catch (Exception e) {
                log.error("TTL 조회 중 오류", e);
            }
        }
        
        if(RedisCertNo == null) {
            log.warn("=== 인증번호 조회 실패 ===");
            log.warn("키 '{}' 에 대한 값이 null입니다.", redisKey);
            log.warn("가능한 원인:");
            log.warn("1. 인증번호 발송이 정상적으로 완료되지 않았음");
            log.warn("2. TTL(3분)이 만료되어 키가 삭제됨");
            log.warn("3. userid가 발송 시와 다름");
            log.warn("4. Redis 저장 시 오류 발생");
            
            responseDto.setReturnCd("40004");
            responseDto.setReturnMsg("인증번호가 존재하지 않습니다.");
            return responseDto;
        } else {
            log.info("=== 인증번호 비교 ===");
            log.info("사용자 입력: '{}'", cert_no);
            log.info("Redis 저장값: '{}'", RedisCertNo);
            
            if(cert_no.equals(RedisCertNo)) {
                log.info("인증번호 일치 - 인증 성공");
                responseDto.setReturnCd("40002");
                responseDto.setReturnMsg("인증번호가 확인되었습니다.");
                
                // 인증 성공 시 키 삭제
                Boolean deleteResult = redisTemplate.delete(redisKey);
                if (Boolean.TRUE.equals(deleteResult)) {
                    log.info("Redis에서 인증번호 키 ('{}') 삭제 성공.", redisKey);
                } else {
                    log.warn("Redis에서 인증번호 키 ('{}') 삭제 실패 또는 키가 이미 존재하지 않음.", redisKey);
                }
            } else {
                log.warn("인증번호 불일치 - 인증 실패");
                responseDto.setReturnCd("40004");
                responseDto.setReturnMsg("인증번호가 다릅니다.");
            }
        }
        
        log.info("=== 인증번호 확인 종료 ===");
        return responseDto;
    }

}
