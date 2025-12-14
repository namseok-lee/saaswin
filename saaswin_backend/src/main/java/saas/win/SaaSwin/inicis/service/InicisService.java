package saas.win.SaaSwin.inicis.service;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.inicis.dto.InicisPayRequestDTO;

@Service
@Slf4j
public class InicisService {
    
    // 명시적 기본 생성자 추가
    public InicisService() {
        super();
    }
    
    @Value("${inicis.mid}")
    private String INICIS_MID;
    @Value("${inicis.signKey}")
    private String INICIS_SIGN_KEY;
    @Value("${inicis.returnUrl}")
    private String INICIS_RETURN_URL;
    @Value("${inicis.cancelUrl}")
    private String INICIS_CANCEL_URL;

    /**
     * 이니시스 빌링키 발급용 데이터를 조합하여 RETURN (1단계)
     */
    public InicisPayRequestDTO getBillingKeyData(InicisPayRequestDTO requestDto) {
        log.info("🔑 [빌링키 발급] INICIS_MID 값: {}", INICIS_MID);
        log.info("🔑 [빌링키 발급] INICIS_SIGN_KEY 값: {}", INICIS_SIGN_KEY);
        
        // 기본 요청값
        String price = requestDto.getPrice();
        String goodname = requestDto.getGoodname();
        String buyername = requestDto.getBuyername();
        String buyertel = requestDto.getBuyertel();
        String buyeremail = requestDto.getBuyeremail();
        String languageView = requestDto.getLanguageView();
        
        // 고유 주문 ID 및 타임스탬프 생성
        String timestamp = String.valueOf(System.currentTimeMillis());
        String oid = "BILL_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        
        log.info("🔑 [빌링키 발급] 생성된 oid: {}", oid);
        log.info("🔑 [빌링키 발급] 생성된 timestamp: {}", timestamp);
    
        // ✅ signKey 처리 - 이니시스 명세에 맞게 수정
        String signKey = INICIS_SIGN_KEY;
        log.info("🔑 [빌링키 발급] 사용할 signKey: {}", signKey);
    
        // ✅ signature 생성: 이니시스 명세에 맞는 포맷
        String signature = generateSha256Hash(oid + price + timestamp);
        log.info("🔑 [빌링키 발급] signature 입력값: {} + {} + {}", oid, price, timestamp);
        log.info("🔑 [빌링키 발급] 생성된 signature: {}", signature);
    
        // ✅ mKey 생성: signKey 원문 그대로 사용
        String mKey = signKey;
        log.info("🔑 [빌링키 발급] 생성된 mKey: {}", mKey);
        
        // ✅ verification 생성용: signKey는 원본 그대로 사용
        String verification = generateSha256Hash(oid + price + signKey + timestamp);
        log.info("🔑 [빌링키 발급] verification 입력값: {} + {} + {} + {}", oid, price, signKey, timestamp);
        log.info("🔑 [빌링키 발급] 생성된 verification: {}", verification);
    
        // ✅ DTO에 값 설정
        requestDto.setMid(INICIS_MID);
        requestDto.setOid(oid);
        requestDto.setTimestamp(Long.parseLong(timestamp));
        requestDto.setSignature(signature);
        requestDto.setVerification(verification);
        requestDto.setMKey(mKey);
        requestDto.setReturnUrl(INICIS_RETURN_URL);
        requestDto.setCloseUrl(INICIS_CANCEL_URL);
        requestDto.setBillkeyReg("Y"); // 빌링키 등록 요청
        requestDto.setVersion("1.0");
        requestDto.setGopaymethod("CARD");
        requestDto.setUse_chkfake("Y");
        requestDto.setCurrency("WON");
        requestDto.setGoodname(goodname);
        requestDto.setBuyername(buyername);
        requestDto.setPrice(price);
        requestDto.setBuyertel(buyertel);
        requestDto.setBuyeremail(buyeremail);
        requestDto.setLanguageView(languageView);
        requestDto.setAcceptmethod("BILLAUTH(Card)"); // 빌링키 발급만, 실제 결제 안함

        log.info("🔑 [빌링키 발급] 최종 응답 DTO: {}", requestDto);
        return requestDto;
    }

    /**
     * 이니시스 결제용 데이터를 조합하여 RETURN (기존 일반 결제용)
    */
    public InicisPayRequestDTO getData(InicisPayRequestDTO requestDto) {
        log.info("INICIS_MID 값: {}", INICIS_MID);
        log.info("INICIS_SIGN_KEY 값: {}", INICIS_SIGN_KEY);
        
        // 기본 요청값
        String price = requestDto.getPrice();
        String goodname = requestDto.getGoodname();
        String buyername = requestDto.getBuyername();
        String buyertel = requestDto.getBuyertel();
        String buyeremail = requestDto.getBuyeremail();
        String languageView = requestDto.getLanguageView();
        
        Long timestamp = System.currentTimeMillis();
        String oid = UUID.randomUUID().toString();
    
        // ✅ signKey 처리 - 이니시스 명세에 맞게 수정
        String signKey = INICIS_SIGN_KEY;
        log.info("사용할 signKey: {}", signKey);
    
        // ✅ signature 생성: 이니시스 명세에 맞는 포맷
        String signature = generateSha256Hash(oid + price + timestamp);
        log.info("signTarget: {}", oid + price + timestamp);
        log.info("생성된 signature: {}", signature);
    
        // ✅ mKey 생성: signKey 원문 그대로 사용
        String mKey = signKey;
        log.info("생성된 mKey: {}", mKey);
        
        // ✅ verification 생성용: signKey는 원본 그대로 사용
        String verification = generateSha256Hash(oid + price + signKey + timestamp);
        log.info("verificationPlain: {}", oid + price + signKey + timestamp);
        log.info("생성된 verification: {}", verification);
    
        // ✅ DTO에 값 설정
        requestDto.setMid(INICIS_MID);
        requestDto.setOid(oid);
        requestDto.setTimestamp(timestamp);
        requestDto.setSignature(signature);
        requestDto.setVerification(verification);
        requestDto.setMKey(mKey);
        requestDto.setReturnUrl(INICIS_RETURN_URL);
        requestDto.setCloseUrl(INICIS_CANCEL_URL);
        requestDto.setBillkeyReg("Y"); // 빌링키 등록 요청
        requestDto.setVersion("1.0");
        requestDto.setGopaymethod("CARD");
        requestDto.setUse_chkfake("Y");
        requestDto.setCurrency("WON");
        requestDto.setGoodname(goodname);
        requestDto.setBuyername(buyername);
        requestDto.setPrice(price);
        requestDto.setBuyertel(buyertel);
        requestDto.setBuyeremail(buyeremail);
        requestDto.setLanguageView(languageView);
        requestDto.setAcceptmethod("BILLAUTH(Card)"); // 빌링키 발급만, 실제 결제 안함

        log.info("최종 응답 DTO: {}", requestDto);
        return requestDto;
    }

    /**
     * 빌링키 발급 결과 처리 (모든 데이터 포함)
     */
    public ResponseEntity<?> processBillingKeyResult(Map<String, String> params) {
        log.info("🔑 [빌링키 발급 결과] === 처리 시작 ===");
        log.info("🔑 [빌링키 발급 결과] 받은 파라미터 전체: {}", params);
        
        String resultCode = params.get("resultCode");
        String resultMsg = params.get("resultMsg");
        String billKey = params.get("billKey");
        String tid = params.get("tid");
        String oid = params.get("orderNumber"); // orderNumber가 실제 oid
        String price = params.get("price");
        String mid = params.get("mid");
        String authToken = params.get("authToken");
        String authUrl = params.get("authUrl");
        String netCancelUrl = params.get("netCancelUrl");
        String checkAckUrl = params.get("checkAckUrl");
        String idc_name = params.get("idc_name");
        String merchantData = params.get("merchantData");
        String charset = params.get("charset");
        String returnUrl = params.get("returnUrl");
        String cardnum = params.get("cardnum");
        
        log.info("🔑 [빌링키 발급 결과] 주요 데이터:");
        log.info("  - resultCode: {}", resultCode);
        log.info("  - resultMsg: {}", resultMsg);
        log.info("  - billKey: {}", billKey);
        log.info("  - tid: {}", tid);
        log.info("  - oid (orderNumber): {}", oid);
        log.info("  - price: {}", price);
        log.info("  - mid: {}", mid);
        log.info("  - authToken: {}", authToken != null ? authToken.substring(0, 50) + "..." : "null");
        log.info("  - authUrl: {}", authUrl);
        log.info("  - netCancelUrl: {}", netCancelUrl);
        log.info("  - checkAckUrl: {}", checkAckUrl);
        log.info("  - idc_name: {}", idc_name);
        log.info("  - merchantData: {}", merchantData);
        log.info("  - charset: {}", charset);
        log.info("  - returnUrl: {}", returnUrl);
        log.info("  - cardnum: {}", cardnum);
        
        // 모든 파라미터가 null인 경우 처리
        if (resultCode == null && resultMsg == null && billKey == null && tid == null && oid == null) {
            log.warn("❌ [빌링키 발급 결과] 모든 파라미터가 null입니다.");
            return ResponseEntity.badRequest().body("빌링키 발급 결과 파라미터가 올바르지 않습니다.");
        }
        
        if (!"0000".equals(resultCode)) {
            log.warn("❌ [빌링키 발급 결과] 실패 - resultCode: {}, resultMsg: {}", resultCode, resultMsg);
            return ResponseEntity.badRequest().body("빌링키 발급 실패: " + resultMsg);
        }
        
        try {
            // ✅ 빌링키 발급 성공 처리
            log.info("✅ [빌링키 발급 결과] 성공 처리 시작");
            
            // TODO: 빌링키를 데이터베이스에 저장
            // saveBillingKeyToDatabase(billKey, tid, oid, price, params);
            
            // 모든 데이터를 포함한 응답
            Map<String, Object> result = new HashMap<>();
            result.put("resultCode", resultCode != null ? resultCode : "");
            result.put("resultMsg", resultMsg != null ? resultMsg : "");
            result.put("billKey", billKey != null ? billKey : "");
            result.put("tid", tid != null ? tid : "");
            result.put("oid", oid != null ? oid : "");
            result.put("price", price != null ? price : "");
            result.put("mid", mid != null ? mid : "");
            result.put("authToken", authToken != null ? authToken : "");
            result.put("authUrl", authUrl != null ? authUrl : "");
            result.put("netCancelUrl", netCancelUrl != null ? netCancelUrl : "");
            result.put("checkAckUrl", checkAckUrl != null ? checkAckUrl : "");
            result.put("idc_name", idc_name != null ? idc_name : "");
            result.put("merchantData", merchantData != null ? merchantData : "");
            result.put("charset", charset != null ? charset : "");
            result.put("returnUrl", returnUrl != null ? returnUrl : "");
            result.put("cardnum", cardnum != null ? cardnum : "");
            result.put("message", "빌링키가 성공적으로 발급되었습니다.");
            
            log.info("✅ [빌링키 발급 결과] 성공 응답 데이터: {}", result);
            log.info("🔑 [빌링키 발급 결과] === 처리 완료 ===");
            
            return ResponseEntity.ok(result);
        
        } catch (Exception e) {
            log.error("❌ [빌링키 발급 결과] 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("빌링키 발급 결과 처리 중 오류가 발생했습니다.");
        }
    }
    
    /**
     * String 값 하나를 SHA-256 해시 값으로 변환합니다.
     * @param textInput 해시할 문자열
     * @return 16진수 문자열 해시 값, 실패 시 null
    */
    public static String generateSha256Hash(String textInput) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(textInput.getBytes(StandardCharsets.UTF_8));
     
            BigInteger number = new BigInteger(1, hashBytes);
            StringBuilder hexString = new StringBuilder(number.toString(16));
            
            // SHA-256 해시 길이는 64자 (256비트 / 4비트)
            while (hexString.length() < 64) {
                hexString.insert(0, '0');
            }
            return hexString.toString();
        }
        catch (NoSuchAlgorithmException e) {
            System.err.println("해시 알고리즘 오류: " + e.getMessage());
            return "결제 데이터 처리 중 오류가 발생했습니다.";
        }   
    }

    /**
     * 빌링키 발급 결과 처리 (STEP 3: 빌링키 발급 승인)
     */
    public ResponseEntity<?> processBillingKeyApproval(Map<String, String> params) {
        String resultCode = params.get("resultCode");
        String resultMsg = params.get("resultMsg");
        String authToken = params.get("authToken");
        String authUrl = params.get("authUrl");
        String netCancelUrl = params.get("netCancelUrl");
        String mid = params.get("mid");
        String oid = params.get("orderNumber") != null ? params.get("orderNumber") : params.get("oid");
        String timestamp = String.valueOf(System.currentTimeMillis());
        
        log.info("🔑 [빌링키 발급 승인] STEP 3 - 빌링키 발급 승인 요청 시작");
        log.info("🔑 [빌링키 발급 승인] resultCode={}, resultMsg={}, oid={}", resultCode, resultMsg, oid);
        log.info("🔑 [빌링키 발급 승인] authToken={}", authToken != null ? authToken.substring(0, 50) + "..." : "null");
        log.info("🔑 [빌링키 발급 승인] authUrl={}", authUrl);
    
        if (!"0000".equals(resultCode)) {
            log.warn("❌ 빌링키 발급 인증 실패: {}", resultMsg);
            return ResponseEntity.badRequest().body("빌링키 발급 실패: " + resultMsg);
        }
    
        try {
            // ✅ signKey 처리
            String decodedSignKey = INICIS_SIGN_KEY;
    
            // ✅ 서명 생성 (빌링키 발급용)
            String signature = generateSha256Hash("authToken=" + authToken + "&timestamp=" + timestamp);
            String verification = generateSha256Hash("authToken=" + authToken + "&signKey=" + decodedSignKey + "&timestamp=" + timestamp);
    
            log.info("🔑 [빌링키 발급 승인] signature: {}", signature);
            log.info("🔑 [빌링키 발급 승인] verification: {}", verification);
    
            // ✅ 이니시스 빌링키 발급 승인 요청 파라미터 구성
            MultiValueMap<String, String> reqParams = new LinkedMultiValueMap<>();
            reqParams.add("mid", mid);
            reqParams.add("authToken", authToken);
            reqParams.add("timestamp", timestamp);
            reqParams.add("signature", signature);
            reqParams.add("verification", verification);
            reqParams.add("charset", "UTF-8");
            reqParams.add("format", "JSON");
    
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(reqParams, headers);
    
            // ✅ 이니시스 빌링키 발급 승인 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(authUrl, requestEntity, Map.class);
            Map<String, Object> result = response.getBody();
    
            log.info("🔑 [빌링키 발급 승인] 승인 응답: {}", result);
    
            if (result == null || !"0000".equals(String.valueOf(result.get("resultCode")))) {
                log.error("❗ 빌링키 발급 승인 실패: {}", result);
    
                // ✅ 망취소 요청 시도
                if (netCancelUrl != null) {
                    try {
                        restTemplate.postForEntity(netCancelUrl, requestEntity, String.class);
                        log.info("✅ 망취소 요청 성공");
                    } catch (Exception cancelEx) {
                        log.error("❌ 망취소 요청 실패: {}", cancelEx.getMessage());
                    }
                }
    
                return ResponseEntity.badRequest().body("빌링키 발급 승인 실패: " + result.get("resultMsg"));
            }
    
            // ✅ 빌링키 발급 승인 성공 처리
            log.info("✅ 빌링키 발급 승인 성공: {}", result);
            
            // 빌링키 정보 추출
            String billKey = String.valueOf(result.get("billKey"));
            String tid = String.valueOf(result.get("tid"));
            String price = String.valueOf(result.get("price"));
            
            log.info("✅ [빌링키 발급 완료] billKey: {}, tid: {}, price: {}", billKey, tid, price);
            
            // TODO: 빌링키를 데이터베이스에 저장
            // saveBillingKeyToDatabase(billKey, tid, oid, price, params);
            
            return ResponseEntity.ok(result);
    
        } catch (Exception e) {
            log.error("❌ 빌링키 발급 승인 요청 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("빌링키 발급 승인 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 일반 결제 승인 처리 (기존 메서드 - 일반 결제용으로 명확히 구분)
     */
    public ResponseEntity<?> processInicisResult(Map<String, String> params) {
        String resultCode = params.get("resultCode");
        String resultMsg = params.get("resultMsg");
        String authToken = params.get("authToken");
        String authUrl = params.get("authUrl");
        String netCancelUrl = params.get("netCancelUrl");
        String mid = params.get("mid");
        String oid = params.get("orderNumber") != null ? params.get("orderNumber") : params.get("oid");
        String timestamp = String.valueOf(System.currentTimeMillis());
        
        log.info("💳 [일반 결제 승인] STEP 3 - 일반 결제 승인 요청 시작");
        log.info("💳 [일반 결제 승인] resultCode={}, resultMsg={}, oid={}", resultCode, resultMsg, oid);
        log.info("💳 [일반 결제 승인] authToken={}", authToken != null ? authToken.substring(0, 50) + "..." : "null");
        log.info("💳 [일반 결제 승인] authUrl={}", authUrl);
    
        if (!"0000".equals(resultCode)) {
            log.warn("❌ 일반 결제 인증 실패: {}", resultMsg);
            return ResponseEntity.badRequest().body("결제 실패: " + resultMsg);
        }
    
        try {
            // ✅ signKey 처리
            String decodedSignKey = INICIS_SIGN_KEY;
    
            // ✅ 서명 생성 (일반 결제용)
            String signature = generateSha256Hash("authToken=" + authToken + "&timestamp=" + timestamp);
            String verification = generateSha256Hash("authToken=" + authToken + "&signKey=" + decodedSignKey + "&timestamp=" + timestamp);
    
            log.info("💳 [일반 결제 승인] signature: {}", signature);
            log.info("💳 [일반 결제 승인] verification: {}", verification);
    
            // ✅ 이니시스 일반 결제 승인 요청 파라미터 구성
            MultiValueMap<String, String> reqParams = new LinkedMultiValueMap<>();
            reqParams.add("mid", mid);
            reqParams.add("authToken", authToken);
            reqParams.add("timestamp", timestamp);
            reqParams.add("signature", signature);
            reqParams.add("verification", verification);
            reqParams.add("charset", "UTF-8");
            reqParams.add("format", "JSON");
    
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(reqParams, headers);
    
            // ✅ 이니시스 일반 결제 승인 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(authUrl, requestEntity, Map.class);
            Map<String, Object> result = response.getBody();
    
            log.info("💳 [일반 결제 승인] 승인 응답: {}", result);
    
            if (result == null || !"0000".equals(String.valueOf(result.get("resultCode")))) {
                log.error("❗ 일반 결제 승인 실패: {}", result);
    
                // ✅ 망취소 요청 시도
                if (netCancelUrl != null) {
                    try {
                        restTemplate.postForEntity(netCancelUrl, requestEntity, String.class);
                        log.info("✅ 망취소 요청 성공");
                    } catch (Exception cancelEx) {
                        log.error("❌ 망취소 요청 실패: {}", cancelEx.getMessage());
                    }
                }
    
                return ResponseEntity.badRequest().body("결제 승인 실패: " + result.get("resultMsg"));
            }
    
            // ✅ 일반 결제 승인 성공 처리
            log.info("✅ 일반 결제 승인 성공: {}", result);
            
            // 결제 정보 추출
            String tid = String.valueOf(result.get("tid"));
            String price = String.valueOf(result.get("price"));
            
            log.info("✅ [일반 결제 완료] tid: {}, price: {}", tid, price);
            
            // TODO: 결제 정보를 데이터베이스에 저장
            // savePaymentToDatabase(tid, oid, price, params);
            
            return ResponseEntity.ok(result);
    
        } catch (Exception e) {
            log.error("❌ 일반 결제 승인 요청 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("결제 승인 처리 중 오류가 발생했습니다.");
        }
    }
    
    /**
     * 빌링키를 사용한 정기결제 처리 (2단계)
     */
    public ResponseEntity<?> processRecurringPayment(String billingKey, String amount, String orderId, String orderName) {
        log.info("💳 [정기결제 2단계] 시작: billingKey={}, amount={}, orderId={}", 
                billingKey.substring(0, 8) + "****", amount, orderId);
        
        try {
            String timestamp = String.valueOf(System.currentTimeMillis());
            String signKey = INICIS_SIGN_KEY;
            
            // ✅ 정기결제용 서명 생성
            String signature = generateSha256Hash("billKey=" + billingKey + "&oid=" + orderId + "&price=" + amount + "&timestamp=" + timestamp);
            String verification = generateSha256Hash("billKey=" + billingKey + "&oid=" + orderId + "&price=" + amount + "&signKey=" + signKey + "&timestamp=" + timestamp);
            
            // ✅ 이니시스 정기결제 요청 파라미터 구성
            MultiValueMap<String, String> reqParams = new LinkedMultiValueMap<>();
            reqParams.add("mid", INICIS_MID);
            reqParams.add("billKey", billingKey);
            reqParams.add("oid", orderId);
            reqParams.add("price", amount);
            reqParams.add("timestamp", timestamp);
            reqParams.add("signature", signature);
            reqParams.add("verification", verification);
            reqParams.add("charset", "UTF-8");
            reqParams.add("format", "JSON");
            reqParams.add("acceptmethod", "BILLPAY(Card)");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(reqParams, headers);
            
            // ✅ 이니시스 정기결제 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            String authUrl = "https://iniapi.inicis.com/api/v1/billpay"; // 정기결제 API URL
            ResponseEntity<Map> response = restTemplate.postForEntity(authUrl, requestEntity, Map.class);
            Map<String, Object> result = response.getBody();
            
            if (result == null || !"0000".equals(String.valueOf(result.get("resultCode")))) {
                log.error("❗ 정기결제 실패: {}", result);
                return ResponseEntity.badRequest().body("정기결제 실패: " + result.get("resultMsg"));
            }
            
            // ✅ 정기결제 성공 처리
            log.info("✅ 정기결제 성공: {}", result);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ 정기결제 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("정기결제 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 정기결제 스케줄링을 위한 배치 처리 메서드
     */
    public ResponseEntity<?> processScheduledRecurringPayment(String billingKey, String amount, String orderId, String orderName, String scheduleDate) {
        log.info("📅 [정기결제 스케줄] 시작: billingKey={}, amount={}, orderId={}, scheduleDate={}", 
                billingKey.substring(0, 8) + "****", amount, orderId, scheduleDate);
        
        try {
            // 스케줄된 날짜에 맞춰 정기결제 실행
            return processRecurringPayment(billingKey, amount, orderId, orderName);
            
        } catch (Exception e) {
            log.error("❌ 스케줄 정기결제 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("스케줄 정기결제 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 정기결제 취소 처리
     */
    public ResponseEntity<?> cancelRecurringPayment(String billingKey, String tid, String cancelAmount) {
        log.info("❌ [정기결제 취소] 시작: billingKey={}, tid={}, cancelAmount={}", 
                billingKey.substring(0, 8) + "****", tid, cancelAmount);
        
        try {
            String timestamp = String.valueOf(System.currentTimeMillis());
            
            // ✅ Base64 디코딩 처리
            String decodedSignKey;
            try {
                byte[] decodedKeyBytes = Base64.getDecoder().decode(INICIS_SIGN_KEY);
                decodedSignKey = new String(decodedKeyBytes, StandardCharsets.UTF_8);
            } catch (Exception e) {
                decodedSignKey = INICIS_SIGN_KEY;
            }
            
            // ✅ 정기결제 취소용 서명 생성
            String signature = generateSha256Hash("billKey=" + billingKey + "&tid=" + tid + "&cancelAmount=" + cancelAmount + "&timestamp=" + timestamp);
            String verification = generateSha256Hash("billKey=" + billingKey + "&tid=" + tid + "&cancelAmount=" + cancelAmount + "&signKey=" + decodedSignKey + "&timestamp=" + timestamp);
            
            // ✅ 이니시스 정기결제 취소 요청 파라미터 구성
            MultiValueMap<String, String> reqParams = new LinkedMultiValueMap<>();
            reqParams.add("mid", INICIS_MID);
            reqParams.add("billKey", billingKey);
            reqParams.add("tid", tid);
            reqParams.add("cancelAmount", cancelAmount);
            reqParams.add("timestamp", timestamp);
            reqParams.add("signature", signature);
            reqParams.add("verification", verification);
            reqParams.add("charset", "UTF-8");
            reqParams.add("format", "JSON");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(reqParams, headers);
            
            // ✅ 이니시스 정기결제 취소 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            String cancelUrl = "https://iniapi.inicis.com/api/v1/billpay/cancel"; // 정기결제 취소 API URL
            ResponseEntity<Map> response = restTemplate.postForEntity(cancelUrl, requestEntity, Map.class);
            Map<String, Object> result = response.getBody();
            
            if (result == null || !"0000".equals(String.valueOf(result.get("resultCode")))) {
                log.error("❗ 정기결제 취소 실패: {}", result);
                return ResponseEntity.badRequest().body("정기결제 취소 실패: " + result.get("resultMsg"));
            }
            
            // ✅ 정기결제 취소 성공 처리
            log.info("✅ 정기결제 취소 성공: {}", result);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ 정기결제 취소 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("정기결제 취소 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 정기결제 상태 조회
     */
    public ResponseEntity<?> getRecurringPaymentStatus(String billingKey) {
        log.info("🔍 [정기결제 상태 조회] 시작: billingKey={}", billingKey.substring(0, 8) + "****");
        
        try {
            String timestamp = String.valueOf(System.currentTimeMillis());
            String decodedSignKey = INICIS_SIGN_KEY;
            
            // ✅ 정기결제 상태 조회용 서명 생성
            String signature = generateSha256Hash("billKey=" + billingKey + "&timestamp=" + timestamp);
            String verification = generateSha256Hash("billKey=" + billingKey + "&signKey=" + decodedSignKey + "&timestamp=" + timestamp);
            
            // ✅ 이니시스 정기결제 상태 조회 요청 파라미터 구성
            MultiValueMap<String, String> reqParams = new LinkedMultiValueMap<>();
            reqParams.add("mid", INICIS_MID);
            reqParams.add("billKey", billingKey);
            reqParams.add("timestamp", timestamp);
            reqParams.add("signature", signature);
            reqParams.add("verification", verification);
            reqParams.add("charset", "UTF-8");
            reqParams.add("format", "JSON");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(reqParams, headers);
            
            // ✅ 이니시스 정기결제 상태 조회 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            String statusUrl = "https://iniapi.inicis.com/api/v1/billkey/status"; // 정기결제 상태 조회 API URL
            ResponseEntity<Map> response = restTemplate.postForEntity(statusUrl, requestEntity, Map.class);
            Map<String, Object> result = response.getBody();
            
            if (result == null) {
                log.error("❗ 정기결제 상태 조회 실패: 응답이 null입니다.");
                return ResponseEntity.badRequest().body("정기결제 상태 조회 실패");
            }
            
            // ✅ 정기결제 상태 조회 성공 처리
            log.info("✅ 정기결제 상태 조회 성공: {}", result);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ 정기결제 상태 조회 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("정기결제 상태 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 빌링키 삭제 처리
     */
    public ResponseEntity<?> deleteBillingKey(String billingKey) {
        log.info("🗑️ [빌링키 삭제] 시작: billingKey={}", billingKey.substring(0, 8) + "****");
        
        try {
            String timestamp = String.valueOf(System.currentTimeMillis());
            
            // ✅ Base64 디코딩 처리
            String decodedSignKey;
            try {
                byte[] decodedKeyBytes = Base64.getDecoder().decode(INICIS_SIGN_KEY);
                decodedSignKey = new String(decodedKeyBytes, StandardCharsets.UTF_8);
            } catch (Exception e) {
                decodedSignKey = INICIS_SIGN_KEY;
            }
            
            // ✅ 빌링키 삭제용 서명 생성
            String signature = generateSha256Hash("billKey=" + billingKey + "&timestamp=" + timestamp);
            String verification = generateSha256Hash("billKey=" + billingKey + "&signKey=" + decodedSignKey + "&timestamp=" + timestamp);
            
            // ✅ 이니시스 빌링키 삭제 요청 파라미터 구성
            MultiValueMap<String, String> reqParams = new LinkedMultiValueMap<>();
            reqParams.add("mid", INICIS_MID);
            reqParams.add("billKey", billingKey);
            reqParams.add("timestamp", timestamp);
            reqParams.add("signature", signature);
            reqParams.add("verification", verification);
            reqParams.add("charset", "UTF-8");
            reqParams.add("format", "JSON");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(reqParams, headers);
            
            // ✅ 이니시스 빌링키 삭제 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            String deleteUrl = "https://iniapi.inicis.com/api/v1/billkey/delete"; // 빌링키 삭제 API URL
            ResponseEntity<Map> response = restTemplate.postForEntity(deleteUrl, requestEntity, Map.class);
            Map<String, Object> result = response.getBody();
            
            if (result == null || !"0000".equals(String.valueOf(result.get("resultCode")))) {
                log.error("❗ 빌링키 삭제 실패: {}", result);
                return ResponseEntity.badRequest().body("빌링키 삭제 실패: " + result.get("resultMsg"));
            }
            
            // ✅ 빌링키 삭제 성공 처리
            log.info("✅ 빌링키 삭제 성공: {}", result);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ 빌링키 삭제 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("빌링키 삭제 처리 중 오류가 발생했습니다.");
        }
    }
}
