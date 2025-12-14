package saas.win.SaaSwin.inicis.service;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;
import saas.win.SaaSwin.inicis.dto.InicisBillingRequestDTO;

@Service
@Slf4j
public class InicisBillingService {
    
    @Value("${inicis.mid}")
    private String INICIS_MID;
    
    @Value("${inicis.signKey}")
    private String INICIS_SIGN_KEY;
    
    @Value("${inicis.apiKey}")
    private String INICIS_API_KEY;
    
    @Value("${inicis.apiIv}")
    private String INICIS_API_IV;
    
    @Value("${inicis.returnUrl}")
    private String INICIS_RETURN_URL;
    
    @Value("${inicis.cancelUrl}")
    private String INICIS_CANCEL_URL;
    
    /**
     * 빌링키 발급용 결제창 데이터 생성 (STEP 1: 인증요청)
     */
    public InicisBillingRequestDTO createBillingKeyRequest(InicisBillingRequestDTO requestDto) {
        log.info("🔑 [빌링키 발급] STEP 1 - 인증요청 데이터 생성 시작");
        
        // 고유 주문번호 생성
        String oid = "BILL_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String timestamp = String.valueOf(System.currentTimeMillis());
        
        log.info("🔑 [빌링키 발급] 생성된 oid: {}", oid);
        log.info("🔑 [빌링키 발급] 생성된 timestamp: {}", timestamp);
        log.info("🔑 [빌링키 발급] 사용할 signKey: {}", INICIS_SIGN_KEY);
        
        // 서명 생성 (이니시스 명세에 맞게)
        // signature = SHA256(oid + price + timestamp)
        String signature = generateSha256Hash(oid + requestDto.getPrice() + timestamp);
        
        // verification = SHA256(oid + price + signKey + timestamp)
        String verification = generateSha256Hash(oid + requestDto.getPrice() + INICIS_SIGN_KEY + timestamp);
        
        // mKey = signKey (원문 그대로 사용)
        String mKey = INICIS_SIGN_KEY;
        
        log.info("🔑 [빌링키 발급] signature 입력값: {} + {} + {}", oid, requestDto.getPrice(), timestamp);
        log.info("🔑 [빌링키 발급] verification 입력값: {} + {} + {} + {}", oid, requestDto.getPrice(), INICIS_SIGN_KEY, timestamp);
        log.info("🔑 [빌링키 발급] signature: {}", signature);
        log.info("🔑 [빌링키 발급] verification: {}", verification);
        log.info("🔑 [빌링키 발급] mKey: {}", mKey);
        
        // DTO 설정 (이니시스 명세에 맞게)
        requestDto.setVersion("1.0");
        requestDto.setGopaymethod(""); // 빈값
        requestDto.setMid(INICIS_MID);
        requestDto.setOid(oid);
        requestDto.setTimestamp(timestamp);
        requestDto.setUse_chkfake("Y");
        requestDto.setSignature(signature);
        requestDto.setVerification(verification);
        requestDto.setMKey(mKey);
        requestDto.setCharset("UTF-8");
        requestDto.setCurrency("WON");
        requestDto.setReturnUrl(INICIS_RETURN_URL);
        requestDto.setCloseUrl(INICIS_CANCEL_URL);
        requestDto.setAcceptmethod("BILLAUTH(Card)"); // 빌링키 발급만, 실제 결제 안함
        requestDto.setBillkeyReg("Y");
        requestDto.setOfferPeriod("Y2"); // 빌링키 발급용 (2년간 유효)
        
        log.info("🔑 [빌링키 발급] STEP 1 완료 - 최종 요청 데이터: {}", requestDto);
        return requestDto;
    }
    
    /**
     * 빌링키 발급 API 호출 (STEP 3: 빌키발급요청)
     */
    public ResponseEntity<?> requestBillingKey(String billKey, String oid, String price, String goodName, 
                                              String buyerName, String buyerEmail, String buyerTel) {
        log.info("🔑 [빌링키 발급] STEP 3 - 빌키발급요청 시작");
        
        try {
            // 타임스탬프 생성 (YYYYMMDDhhmmss 형식)
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
            String timestamp = sdf.format(new Date());
            
            // 요청 데이터 구성 (메뉴얼 명세에 맞게)
            Map<String, Object> data = new HashMap<>();
            data.put("url", "www.inicis.com");
            data.put("moid", oid);
            data.put("goodName", goodName);
            data.put("buyerName", buyerName);
            data.put("buyerEmail", buyerEmail);
            data.put("buyerTel", buyerTel);
            data.put("price", price);
            data.put("billKey", billKey);
            data.put("authentification", "00"); // 본인인증 안함
            data.put("currency", "WON");
            data.put("cardQuota", "00"); // 일시불
            
            JSONObject dataJson = new JSONObject(data);
            
            // HashData 생성 (SHA512) - 메뉴얼 명세에 맞게
            String plainText = INICIS_API_KEY + INICIS_MID + "billing" + timestamp + dataJson.toString();
            plainText = plainText.replaceAll("\\\\", "");
            String hashData = generateSha512Hash(plainText);
            
            log.info("🔑 [빌링키 발급] plainText: {}", plainText);
            log.info("🔑 [빌링키 발급] hashData: {}", hashData);
            
            // 요청 파라미터 구성 (메뉴얼 명세에 맞게)
            JSONObject requestJson = new JSONObject();
            requestJson.put("mid", INICIS_MID);
            requestJson.put("type", "billing");
            requestJson.put("paymethod", "card");
            requestJson.put("timestamp", timestamp);
            requestJson.put("clientIp", "127.0.0.1");
            requestJson.put("data", dataJson);
            requestJson.put("hashData", hashData);
            
            // API 호출 (메뉴얼 명세 URL)
            String apiUrl = "https://iniapi.inicis.com/v2/pg/billing";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> requestEntity = new HttpEntity<>(requestJson.toString(), headers);
            
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);
            
            Map<String, Object> result = response.getBody();
            log.info("🔑 [빌링키 발급] STEP 3 완료 - 응답: {}", result);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ [빌링키 발급] STEP 3 실패", e);
            return ResponseEntity.status(500).body("빌링키 발급 요청 중 오류가 발생했습니다.");
        }
    }
    
    /**
     * SHA-256 해시 생성 (개선된 버전)
     */
    private String generateSha256Hash(String textInput) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(textInput.getBytes(StandardCharsets.UTF_8));
            
            BigInteger number = new BigInteger(1, hashBytes);
            StringBuilder hexString = new StringBuilder(number.toString(16));
            
            while (hexString.length() < 64) {
                hexString.insert(0, '0');
            }
            
            log.info("🔑 [해시 생성] 입력값: {}", textInput);
            log.info("🔑 [해시 생성] 결과: {}", hexString.toString());
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("❌ SHA-256 해시 생성 오류", e);
            return null;
        }
    }
    
    /**
     * SHA-512 해시 생성 (빌링키 발급 API용)
     */
    private String generateSha512Hash(String textInput) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] hashBytes = digest.digest(textInput.getBytes(StandardCharsets.UTF_8));
            
            BigInteger number = new BigInteger(1, hashBytes);
            StringBuilder hexString = new StringBuilder(number.toString(16));
            
            while (hexString.length() < 128) {
                hexString.insert(0, '0');
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-512 해시 생성 오류", e);
            return null;
        }
    }

    /**
     * 서명 생성 테스트 (디버깅용)
     */
    public void testSignatureGeneration() {
        String testOid = "BILL_TEST123456789";
        String testPrice = "1000";
        String testTimestamp = "1750316824827";
        String testSignKey = INICIS_SIGN_KEY;
        
        log.info("🧪 [서명 테스트] 시작");
        log.info("🧪 [서명 테스트] oid: {}", testOid);
        log.info("🧪 [서명 테스트] price: {}", testPrice);
        log.info("🧪 [서명 테스트] timestamp: {}", testTimestamp);
        log.info("🧪 [서명 테스트] signKey: {}", testSignKey);
        
        // signature = SHA256(oid + price + timestamp)
        String signature = generateSha256Hash(testOid + testPrice + testTimestamp);
        
        // verification = SHA256(oid + price + signKey + timestamp)
        String verification = generateSha256Hash(testOid + testPrice + testSignKey + testTimestamp);
        
        // mKey = signKey (원문 그대로 사용)
        String mKey = testSignKey;
        
        log.info("🧪 [서명 테스트] signature 입력값: {} + {} + {}", testOid, testPrice, testTimestamp);
        log.info("🧪 [서명 테스트] verification 입력값: {} + {} + {} + {}", testOid, testPrice, testSignKey, testTimestamp);
        log.info("🧪 [서명 테스트] signature: {}", signature);
        log.info("🧪 [서명 테스트] verification: {}", verification);
        log.info("🧪 [서명 테스트] mKey: {}", mKey);
        log.info("🧪 [서명 테스트] 완료");
    }
} 