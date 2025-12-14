package saas.win.SaaSwin.inicis.controller;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.util.MultiValueMap;

import lombok.RequiredArgsConstructor;
import saas.win.SaaSwin.inicis.dto.InicisPayRequestDTO;
import saas.win.SaaSwin.inicis.dto.InicisBillingRequestDTO;
import saas.win.SaaSwin.inicis.dto.InicisBillingCreateRequestDTO;
import saas.win.SaaSwin.inicis.dto.InicisBillingCreateResponseDTO;
import saas.win.SaaSwin.inicis.service.InicisService;
import saas.win.SaaSwin.inicis.service.InicisBillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/{rprsOgnzNo}/api/inicis")
@RequiredArgsConstructor
public class InicisController {

    private final InicisService inicisService;
    private final InicisBillingService inicisBillingService;
    private static final Logger log = LoggerFactory.getLogger(InicisController.class);

    @Value("${inicis.mid}")
    private String INICIS_MID;
    
    @Value("${inicis.signKey}")
    private String INICIS_SIGN_KEY;
    
    @Value("${inicis.mKey}")
    private String INICIS_MKEY;
    
    @Value("${inicis.returnUrl}")
    private String INICIS_RETURN_URL;
    
    @Value("${inicis.cancelUrl}")
    private String INICIS_CANCEL_URL;

    /**
     * 이니시스 결제를 위한 데이터 조합
     */
    @PostMapping("/paymentData")
    public ResponseEntity<InicisPayRequestDTO> paymentData(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody InicisPayRequestDTO request) {
        return ResponseEntity.ok(inicisService.getData(request));
    }

    /**
     * 빌링키 발급용 결제 정보 반환 (STEP 1: 인증요청)
     */
    @GetMapping("/billing-key")
    public ResponseEntity<?> getBillingKeyData(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestParam Map<String, String> params) {
        try {
            log.info("🔑 [빌링키 발급] STEP 1 - 인증요청 시작");
            
            // 파라미터 추출
            String price = params.get("price");
            String goodname = params.get("goodname");
            String buyername = params.get("buyername");
            String buyertel = params.get("buyertel");
            String buyeremail = params.get("buyeremail");
            String languageView = params.getOrDefault("languageView", "ko");
            
            // 필수 파라미터 검증
            if (price == null || goodname == null || buyername == null) {
                return ResponseEntity.badRequest().body("필수 파라미터가 누락되었습니다.");
            }
            
            // DTO 생성
            InicisBillingRequestDTO requestDto = new InicisBillingRequestDTO();
            requestDto.setPrice(price);
            requestDto.setGoodname(goodname);
            requestDto.setBuyername(buyername);
            requestDto.setBuyertel(buyertel);
            requestDto.setBuyeremail(buyeremail);
            
            // 빌링키 발급용 데이터 생성 (서명 포함)
            InicisBillingRequestDTO result = inicisBillingService.createBillingKeyRequest(requestDto);
            
            log.info("🔑 [빌링키 발급] STEP 1 완료 - 서명 생성됨");
            log.info("🔑 [빌링키 발급] signature: {}", result.getSignature());
            log.info("🔑 [빌링키 발급] verification: {}", result.getVerification());
            log.info("🔑 [빌링키 발급] mKey: {}", result.getMKey());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ [빌링키 발급] STEP 1 실패", e);
            return ResponseEntity.status(500).body("빌링키 발급 데이터 생성 중 오류가 발생했습니다.");
        }
    }

    /**
     * 새로운 빌링키 발급 엔드포인트 (JavaScript 코드 변환)
     * 
     * POST /api/inicis/billing/create
     * 
     * 요청 예시:
     * {
     *   "mid": "INIBillTst",
     *   "oid": "ORDER_123456789",
     *   "price": "1000",
     *   "goodname": "테스트상품",
     *   "buyername": "테스터",
     *   "buyertel": "01012345678",
     *   "buyeremail": "test@test.com"
     * }
     * 
     * 응답 예시:
     * {
     *   "success": true,
     *   "message": null,
     *   "data": { ... }
     * }
     */
    @PostMapping("/billing/create")
    public ResponseEntity<InicisBillingCreateResponseDTO> createBillingKey(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody InicisBillingCreateRequestDTO request) {
        try {
            log.info("🔑 [새로운 빌링키 발급] 요청 시작");
            log.info("🔑 [새로운 빌링키 발급] 요청 데이터: {}", request);
            
            // 요청 파라미터 추출 (기본값 설정)
            String mid = request.getMid() != null ? request.getMid() : INICIS_MID;
            String oid = request.getOid();
            String price = request.getPrice() != null ? request.getPrice() : "1";
            String goodname = request.getGoodname() != null ? request.getGoodname() : "화이트정보통신 데모신청";
            String buyername = request.getBuyername() != null ? request.getBuyername() : "신승록";
            String buyertel = request.getBuyertel() != null ? request.getBuyertel() : "010-1234-5678";
            String buyeremail = request.getBuyeremail() != null ? request.getBuyeremail() : "dustn0234@win.co.kr";
            String languageView = request.getLanguageView() != null ? request.getLanguageView() : "ko";

            // oid가 없으면 자동 생성
            if (oid == null || oid.trim().isEmpty()) {
                oid = "ORDER_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
                log.info("🔑 [새로운 빌링키 발급] oid 자동 생성: {}", oid);
            }

            log.info("🔑 [새로운 빌링키 발급] 추출된 파라미터:");
            log.info("  - mid: {}", mid);
            log.info("  - oid: {}", oid);
            log.info("  - price: {}", price);
            log.info("  - goodname: {}", goodname);
            log.info("  - buyername: {}", buyername);
            log.info("  - buyertel: {}", buyertel);
            log.info("  - buyeremail: {}", buyeremail);
            log.info("  - languageView: {}", languageView);

            // 필수 파라미터 검증 (oid는 이제 항상 존재함)
            if (price == null || price.trim().isEmpty()) {
                log.warn("❌ [새로운 빌링키 발급] 결제금액(price) 누락");
                return ResponseEntity.badRequest().body(new InicisBillingCreateResponseDTO(
                    false, "결제금액(price)은 필수입니다.", null
                ));
            }

            // 이니시스 설정
            String signKey = INICIS_SIGN_KEY;
            String timestamp = String.valueOf(System.currentTimeMillis()); // Unix timestamp (밀리초)
            
            log.info("🔑 [새로운 빌링키 발급] 이니시스 설정:");
            log.info("  - signKey: {}", signKey);
            log.info("  - timestamp: {}", timestamp);
            
            // signature 생성
            String signature = generateSHA256(oid + price + timestamp).toLowerCase();
            
            // verification 생성
            String verification = generateSHA256(oid + price + signKey + timestamp).toLowerCase();
            
            // mKey = signKey (원문 그대로)
            String mKey = signKey;
            
            log.info("🔑 [새로운 빌링키 발급] 서명 생성:");
            log.info("  - signature 입력값: {} + {} + {}", oid, price, timestamp);
            log.info("  - verification 입력값: {} + {} + {} + {}", oid, price, signKey, timestamp);
            log.info("  - signature: {}", signature);
            log.info("  - verification: {}", verification);
            log.info("  - mKey: {}", mKey);

            // 이니시스 결제창 파라미터
            Map<String, String> paymentParams = new HashMap<>();
            paymentParams.put("version", "1.0");
            paymentParams.put("gopaymethod", ""); // 빈 값으로 설정
            paymentParams.put("mid", mid);
            paymentParams.put("oid", oid);
            paymentParams.put("price", price);
            paymentParams.put("timestamp", timestamp);
            paymentParams.put("use_chkfake", "Y");
            paymentParams.put("signature", signature);
            paymentParams.put("verification", verification);
            paymentParams.put("mKey", mKey);
            paymentParams.put("offerPeriod", "Y2"); // 빌링키 발급용 (2년간 유효)
            paymentParams.put("charset", "UTF-8");
            paymentParams.put("currency", "WON");
            paymentParams.put("goodname", goodname);
            paymentParams.put("buyername", buyername);
            paymentParams.put("buyertel", buyertel);
            paymentParams.put("buyeremail", buyeremail);
            paymentParams.put("languageView", languageView);
            paymentParams.put("returnUrl", INICIS_RETURN_URL);
            paymentParams.put("closeUrl", INICIS_CANCEL_URL);
            paymentParams.put("acceptmethod", "BILLAUTH(Card)"); // 빌링키 발급만, 실제 결제 안함

            log.info("🔑 [새로운 빌링키 발급] 결제창 파라미터:");
            paymentParams.forEach((key, value) -> {
                log.info("  - {}: {}", key, value);
            });

            log.info("✅ [새로운 빌링키 발급] 성공 - 결제 파라미터 생성됨");
            log.info("🔑 [새로운 빌링키 발급] 이제 프론트엔드에서 결제창을 호출하면 빌링키 발급 과정이 진행됩니다.");
            log.info("🔑 [새로운 빌링키 발급] 실제 결제는 진행되지 않고, 카드 정보만 등록됩니다.");

            return ResponseEntity.ok(new InicisBillingCreateResponseDTO(
                true, null, paymentParams
            ));

        } catch (Exception e) {
            log.error("❌ [새로운 빌링키 발급] 오류 발생", e);
            return ResponseEntity.status(500).body(new InicisBillingCreateResponseDTO(
                false, "서버 오류가 발생했습니다.", null
            ));
        }
    }

    /**
     * 이니시스 결제 결과 수신 (JSON 응답용 - 프론트엔드 연동)
     */
    @PostMapping("/return-json")
    public ResponseEntity<?> handleReturnJson(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody(required = false) Map<String, Object> resultData,
                                             @RequestParam MultiValueMap<String, String> params,
                                             HttpServletRequest request) {
        try {
            log.info("🔗 [이니시스 Return JSON] 결제 결과 수신 시작");
            log.info("🔗 [이니시스 Return JSON] 요청 URL: {}", request.getRequestURL());
            log.info("🔗 [이니시스 Return JSON] 요청 메서드: {}", request.getMethod());
            log.info("🔗 [이니시스 Return JSON] Content-Type: {}", request.getContentType());
            
            // 1. 모든 소스에서 데이터 수집
            Map<String, Object> allData = new HashMap<>();
            
            // POST Body 데이터
            if (resultData != null && !resultData.isEmpty()) {
                log.info("🔗 [이니시스 Return JSON] POST Body 데이터: {}", resultData);
                allData.putAll(resultData);
            }
            
            // Query Parameters 데이터
            if (params != null && !params.isEmpty()) {
                log.info("🔗 [이니시스 Return JSON] Query Parameters: {}", params);
                for (Map.Entry<String, List<String>> entry : params.entrySet()) {
                    String key = entry.getKey();
                    List<String> values = entry.getValue();
                    if (values != null && !values.isEmpty()) {
                        allData.put(key, values.get(0));
                    }
                }
            }
            
            // HTTP 헤더에서 데이터 추출
            Map<String, String> headerData = extractPaymentDataFromHeaders(request);
            if (!headerData.isEmpty()) {
                log.info("🔗 [이니시스 Return JSON] HTTP 헤더 데이터: {}", headerData);
                allData.putAll(headerData);
            }
            
            log.info("🔗 [이니시스 Return JSON] 최종 수집된 데이터: {}", allData);
            
            // 2. 결제 결과 처리
            if (allData.isEmpty()) {
                log.warn("❌ [이니시스 Return JSON] 결제 데이터가 없습니다.");
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "결제 데이터가 없습니다."
                ));
            }
            
            // 3. 필수 데이터 검증
            String resultCode = (String) allData.get("resultCode");
            if (resultCode == null || resultCode.trim().isEmpty()) {
                log.warn("❌ [이니시스 Return JSON] resultCode가 누락되었습니다.");
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "결제 결과 코드가 누락되었습니다."
                ));
            }
            
            // 4. 결제 성공/실패 판단
            boolean isSuccess = "0000".equals(resultCode);
            
            if (isSuccess) {
                log.info("✅ [이니시스 Return JSON] 결제 성공 - resultCode: {}", resultCode);
                
                // 여기서 결제 결과를 DB에 저장하거나 처리
                // TODO: DB 저장 로직 추가
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "결제가 성공적으로 처리되었습니다.",
                    "data", allData
                ));
            } else {
                String resultMsg = (String) allData.get("resultMsg");
                log.warn("❌ [이니시스 Return JSON] 결제 실패 - resultCode: {}, resultMsg: {}", resultCode, resultMsg);
                
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", resultMsg != null ? resultMsg : "결제 처리에 실패했습니다.",
                    "data", allData
                ));
            }
            
        } catch (Exception e) {
            log.error("❌ [이니시스 Return JSON] 처리 중 예외 발생", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "결제 결과 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 이니시스 결제 결과 수신 (STEP 2: 인증결과)
     */
    @PostMapping("/return")
    public void handleReturn(@PathVariable("rprsOgnzNo") String rprsOgnzNo, HttpServletRequest request, HttpServletResponse response,
                           @RequestParam MultiValueMap<String, String> params,
                           @RequestBody(required = false) String body) throws IOException {
        try {
            log.info("🔗 [이니시스 Return] STEP 2 - 인증결과 수신 시작");
            log.info("🔗 [이니시스 Return] 요청 URL: {}", request.getRequestURL());
            log.info("🔗 [이니시스 Return] 요청 메서드: {}", request.getMethod());
            log.info("🔗 [이니시스 Return] Content-Type: {}", request.getContentType());
            
            // 1. 모든 HTTP 헤더 정보 로깅
            logAllHeaders(request);
            
            // 2. Query Parameters 확인
            log.info("🔗 [이니시스 Return] === Query Parameters ===");
            log.info("🔗 [이니시스 Return] Query String: {}", request.getQueryString());
            if (params != null && !params.isEmpty()) {
                log.info("🔗 [이니시스 Return] Query Parameters: {}", params);
            } else {
                log.info("🔗 [이니시스 Return] Query Parameters: 없음");
            }
            
            // 3. POST Body 확인
            log.info("🔗 [이니시스 Return] === POST Body ===");
            if (body != null && !body.trim().isEmpty()) {
                log.info("🔗 [이니시s Return] POST Body: {}", body);
            } else {
                log.info("🔗 [이니시스 Return] POST Body: 빈값");
            }
            
            // 4. 모든 소스에서 데이터 추출
            Map<String, String> paymentData = extractPaymentDataFromAllSources(request, params, body);
            log.info("🔗 [이니시스 Return] 최종 추출된 데이터: {}", paymentData);
            log.info("🔗 [이니시스 Return] 추출된 데이터 개수: {}", paymentData.size());
            
            // 5. 결제 데이터 검증
            if (paymentData.isEmpty()) {
                log.warn("❌ [이니시스 Return] 모든 소스에서 결제 데이터를 찾을 수 없습니다.");
                redirectToFrontend(response, "error", "결제 데이터를 찾을 수 없습니다.");
                return;
            }
            
            // 6. 필수 데이터 검증
            String validationResult = validateRequiredData(paymentData);
            if (validationResult != null) {
                log.warn("❌ [이니시스 Return] 필수 데이터 누락: {}", validationResult);
                redirectToFrontend(response, "error", "필수 데이터가 누락되었습니다: " + validationResult);
                return;
            }
            
            // 7. 결제 결과 처리
            String resultCode = paymentData.get("resultCode");
            String authToken = paymentData.get("authToken");
            String oid = paymentData.get("orderNumber") != null ? paymentData.get("orderNumber") : paymentData.get("oid");
            String acceptmethod = paymentData.get("acceptmethod"); // 결제 방식 확인
            
            log.info("🔗 [이니시스 Return] resultCode: {}, authToken: {}, oid: {}, acceptmethod: {}", 
                    resultCode, authToken, oid, acceptmethod);
            
            // 8. 결제 방식에 따른 처리 분기
            ResponseEntity<?> result;
            
            // acceptmethod가 "BILLAUTH(Card)"인 경우 빌링키 발급 처리
            if (acceptmethod != null && acceptmethod.contains("BILLAUTH")) {
                log.info("🔑 [이니시스 Return] 빌링키 발급 승인 처리 시작");
                result = inicisService.processBillingKeyApproval(paymentData);
            } else {
                log.info("💳 [이니시스 Return] 일반 결제 승인 처리 시작");
                result = inicisService.processInicisResult(paymentData);
            }
            
            // 9. 처리 결과에 따른 프론트엔드 리다이렉트
            if (result.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> successData = (Map<String, Object>) result.getBody();
                log.info("✅ [이니시스 Return] 성공 데이터: {}", successData);
                redirectToFrontend(response, "success", successData);
            } else {
                String errorMessage = (String) result.getBody();
                log.warn("❌ [이니시스 Return] 실패: {}", errorMessage);
                redirectToFrontend(response, "error", errorMessage);
            }
            
        } catch (Exception e) {
            log.error("❌ [이니시스 Return] 처리 중 예외 발생", e);
            redirectToFrontend(response, "error", "결제 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 모든 HTTP 헤더 정보 로깅
     */
    private void logAllHeaders(HttpServletRequest request) {
        log.info("🔗 [이니시스 Return] === 모든 HTTP 헤더 정보 ===");
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            log.info("🔗 [이니시스 Return] 헤더 - {}: {}", headerName, headerValue);
        }
        log.info("🔗 [이니시스 Return] === HTTP 헤더 정보 끝 ===");
    }

    /**
     * 모든 소스에서 결제 데이터 추출
     */
    private Map<String, String> extractPaymentDataFromAllSources(HttpServletRequest request, 
                                                                MultiValueMap<String, String> params, 
                                                                String body) {
        Map<String, String> paymentData = new HashMap<>();
        
        // 1. HTTP 헤더에서 추출
        log.info("🔗 [이니시스 Return] === HTTP 헤더에서 데이터 추출 ===");
        Map<String, String> headerData = extractPaymentDataFromHeaders(request);
        paymentData.putAll(headerData);
        log.info("🔗 [이니시스 Return] 헤더에서 추출된 데이터: {}", headerData);
        
        // 2. Query Parameters에서 추출
        log.info("🔗 [이니시스 Return] === Query Parameters에서 데이터 추출 ===");
        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, List<String>> entry : params.entrySet()) {
                String key = entry.getKey();
                List<String> values = entry.getValue();
                if (values != null && !values.isEmpty()) {
                    paymentData.put(key, values.get(0));
                    log.info("🔗 [이니시스 Return] Query에서 추출됨 - {}: {}", key, values.get(0));
                }
            }
        }
        
        // 3. POST Body에서 추출 (form-data)
        log.info("🔗 [이니시스 Return] === POST Body에서 데이터 추출 ===");
        if (body != null && !body.trim().isEmpty()) {
            try {
                // form-data 형태인지 확인
                String[] pairs = body.split("&");
                for (String pair : pairs) {
                    String[] keyValue = pair.split("=");
                    if (keyValue.length == 2) {
                        String key = keyValue[0];
                        String value = keyValue[1];
                        paymentData.put(key, value);
                        log.info("🔗 [이니시스 Return] Form Body에서 추출됨 - {}: {}", key, value);
                    }
                }
            } catch (Exception e) {
                log.warn("🔗 [이니시스 Return] POST Body 파싱 실패: {}", e.getMessage());
            }
        }
        
        log.info("🔗 [이니시스 Return] === 모든 소스에서 데이터 추출 완료 ===");
        log.info("🔗 [이니시스 Return] 최종 통합 데이터: {}", paymentData);
        
        return paymentData;
    }

    /**
     * HTTP 헤더에서 결제 데이터 추출
     */
    private Map<String, String> extractPaymentDataFromHeaders(HttpServletRequest request) {
        Map<String, String> paymentData = new HashMap<>();
        
        // 이니시스에서 전송하는 주요 헤더들
        String[] headerNames = {
            "resultCode", "resultMsg", "billKey", "tid", "oid", "price",
            "authToken", "authUrl", "netCancelUrl", "mid", "goodName",
            "buyerName", "buyerEmail", "buyerTel", "payMethod", "cardCode",
            "cardQuota", "checkFlg", "prtcCode", "cardNumber", "payDate",
            "payTime", "payAuthCode", "usePoint", "cardPoint", "partnerDiscount",
            "eventFlag", "currency", "orgPrice", "tax", "taxFree", "cardQuota",
            "quotaInterest", "regNo", "cardPw", "orderNumber", "charset",
            "returnUrl", "checkAckUrl", "idc_name", "merchantData"
        };
        
        for (String headerName : headerNames) {
            String value = request.getHeader(headerName);
            if (value != null && !value.trim().isEmpty()) {
                paymentData.put(headerName, value);
                log.info("🔗 [이니시스 Return] 헤더에서 추출됨 - {}: {}", headerName, value);
            } else {
                log.info("🔗 [이니시스 Return] 헤더에서 누락됨 - {}: null 또는 빈값", headerName);
            }
        }
        
        return paymentData;
    }

    /**
     * 필수 데이터 검증 (STEP 2용)
     */
    private String validateRequiredData(Map<String, String> paymentData) {
        log.info("🔗 [이니시스 Return] === 필수 데이터 검증 시작 ===");
        
        // STEP 2에서 필요한 필수 데이터 (메뉴얼 명세에 맞게)
        String[] requiredFields = {"resultCode"};
        String[] optionalFields = {"resultMsg", "authToken", "orderNumber", "oid", "mid", "authUrl", "netCancelUrl"};
        
        // 필수 데이터 검증
        for (String field : requiredFields) {
            String value = paymentData.get(field);
            if (value == null || value.trim().isEmpty()) {
                log.warn("❌ [이니시스 Return] 필수 데이터 누락: {}", field);
                return field;
            }
            log.info("✅ [이니시스 Return] 필수 데이터 확인됨 - {}: {}", field, value);
        }
        
        // orderNumber 또는 oid 중 하나는 있어야 함
        String orderNumber = paymentData.get("orderNumber");
        String oid = paymentData.get("oid");
        if ((orderNumber == null || orderNumber.trim().isEmpty()) && 
            (oid == null || oid.trim().isEmpty())) {
            log.warn("❌ [이니시스 Return] orderNumber 또는 oid가 모두 누락됨");
            return "orderNumber 또는 oid";
        }
        
        // 선택 데이터 확인
        for (String field : optionalFields) {
            String value = paymentData.get(field);
            if (value == null || value.trim().isEmpty()) {
                log.warn("⚠️ [이니시스 Return] 선택 데이터 누락: {}", field);
            } else {
                log.info("✅ [이니시스 Return] 선택 데이터 확인됨 - {}: {}", field, value);
            }
        }
        
        log.info("🔗 [이니시스 Return] === 필수 데이터 검증 완료 ===");
        return null; // 검증 통과
    }

    /**
     * 프론트엔드로 리다이렉트
     */
    private void redirectToFrontend(HttpServletResponse response, String status, Object data) throws IOException {
        String frontendUrl = INICIS_RETURN_URL.replace("/inicis/return", "/payment/result");
        String redirectUrl;
        
        log.info("🔗 [이니시스 Return] === 프론트엔드 리다이렉트 준비 ===");
        log.info("🔗 [이니시스 Return] 상태: {}", status);
        log.info("🔗 [이니시스 Return] 데이터: {}", data);
        
        if ("success".equals(status)) {
            // 성공 시
            if (data instanceof Map) {
                Map<String, Object> successData = (Map<String, Object>) data;
                
                // URL 인코딩을 사용하여 안전한 쿼리 스트링 생성
                StringBuilder queryString = new StringBuilder();
                queryString.append("status=success");
                
                // 모든 데이터를 URL 인코딩하여 추가
                String[] fields = {
                    "resultCode", "resultMsg", "billKey", "tid", "oid", "price", "message",
                    "authToken", "authUrl", "netCancelUrl", "checkAckUrl", "mid", "idc_name",
                    "merchantData", "charset", "returnUrl", "cardnum"
                };
                
                for (String field : fields) {
                    Object value = successData.get(field);
                    if (value != null && !value.toString().trim().isEmpty()) {
                        String encodedValue = URLEncoder.encode(value.toString(), StandardCharsets.UTF_8);
                        queryString.append("&").append(field).append("=").append(encodedValue);
                        log.info("🔗 [이니시스 Return] 쿼리 파라미터 추가 - {}: {} (인코딩: {})", field, value, encodedValue);
                    } else {
                        log.info("🔗 [이니시스 Return] 쿼리 파라미터 누락 - {}: null 또는 빈값", field);
                    }
                }
                
                redirectUrl = frontendUrl + "?" + queryString.toString();
            } else {
                redirectUrl = frontendUrl + "?status=success";
            }
        } else {
            // 실패 시
            String errorMessage = data != null ? data.toString() : "알 수 없는 오류";
            String encodedMessage = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
            redirectUrl = frontendUrl + "?status=error&message=" + encodedMessage;
            log.info("🔗 [이니시스 Return] 에러 메시지 인코딩 - 원본: {}, 인코딩: {}", errorMessage, encodedMessage);
        }
        
        log.info("🔗 [이니시스 Return] 최종 리다이렉트 URL: {}", redirectUrl);
        log.info("🔗 [이니시스 Return] === 프론트엔드 리다이렉트 완료 ===");
        
        response.sendRedirect(redirectUrl);
    }

    /**
     * 이니시스 데이터 전송 방식 테스트용 엔드포인트
     */
    @PostMapping("/test-return")
    public ResponseEntity<?> testReturn(@PathVariable("rprsOgnzNo") String rprsOgnzNo, HttpServletRequest request,
                                       @RequestParam MultiValueMap<String, String> params,
                                       @RequestBody(required = false) String body) {
        log.info("🧪 [테스트 Return] 요청 시작");
        log.info("🧪 [테스트 Return] Content-Type: {}", request.getContentType());
        log.info("🧪 [테스트 Return] Query String: {}", request.getQueryString());
        log.info("�� [테스트 Return] Query Parameters: {}", params);
        log.info("🧪 [테스트 Return] POST Body: {}", body);
        
        // 모든 헤더 로깅
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            log.info("🧪 [테스트 Return] 헤더 - {}: {}", headerName, headerValue);
        }
        
        return ResponseEntity.ok("테스트 완료");
    }

    /**
     * 서명 생성 테스트 (디버깅용)
     */
    @GetMapping("/test-signature")
    public ResponseEntity<?> testSignature(@PathVariable("rprsOgnzNo") String rprsOgnzNo) {
        try {
            inicisBillingService.testSignatureGeneration();
            return ResponseEntity.ok("서명 생성 테스트 완료");
        } catch (Exception e) {
            log.error("❌ 서명 생성 테스트 실패", e);
            return ResponseEntity.status(500).body("서명 생성 테스트 실패: " + e.getMessage());
        }
    }

    /**
     * SHA-256 해시 생성 유틸리티 메서드
     */
    private String generateSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 알고리즘을 찾을 수 없습니다.", e);
            throw new RuntimeException("SHA-256 해시 생성 실패", e);
        }
    }

    /**
     * 빌링키 발급 파라미터 디버깅용 엔드포인트
     */
    @GetMapping("/billing/debug")
    public ResponseEntity<?> debugBillingParams(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestParam Map<String, String> params) {
        try {
            log.info("🔍 [빌링키 디버깅] 요청 시작");
            
            // 요청 파라미터 추출 (기본값 설정)
            String mid = params.getOrDefault("mid", INICIS_MID);
            String oid = params.get("oid");
            String price = params.getOrDefault("price", "1");
            String goodname = params.getOrDefault("goodname", "화이트정보통신 데모신청");
            String buyername = params.getOrDefault("buyername", "신승록");
            String buyertel = params.getOrDefault("buyertel", "010-1234-5678");
            String buyeremail = params.getOrDefault("buyeremail", "dustn0234@win.co.kr");

            // 필수 파라미터 검증
            if (oid == null || oid.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("주문번호(oid)는 필수입니다.");
            }

            // 이니시스 설정
            String signKey = INICIS_SIGN_KEY;
            String timestamp = String.valueOf(System.currentTimeMillis());
            
            // signature 생성
            Map<String, String> signParam = new HashMap<>();
            signParam.put("oid", oid);
            signParam.put("price", price);
            signParam.put("timestamp", timestamp);
            
            String signString = signParam.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
            
            String signature = generateSHA256(signString).toLowerCase();
            
            // verification 생성
            Map<String, String> verificationParam = new HashMap<>(signParam);
            verificationParam.put("signKey", signKey);
            
            String verificationString = verificationParam.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
            
            String verification = generateSHA256(verificationString).toLowerCase();

            // 이니시스 결제창 파라미터
            Map<String, String> paymentParams = new HashMap<>();
            paymentParams.put("version", "1.0");
            paymentParams.put("gopaymethod", "");
            paymentParams.put("mid", mid);
            paymentParams.put("oid", oid);
            paymentParams.put("price", price);
            paymentParams.put("timestamp", timestamp);
            paymentParams.put("use_chkfake", "Y");
            paymentParams.put("signature", signature);
            paymentParams.put("verification", verification);
            paymentParams.put("mKey", signKey);
            paymentParams.put("offerPeriod", "Y2");
            paymentParams.put("charset", "UTF-8");
            paymentParams.put("currency", "WON");
            paymentParams.put("goodname", goodname);
            paymentParams.put("buyername", buyername);
            paymentParams.put("buyertel", buyertel);
            paymentParams.put("buyeremail", buyeremail);
            paymentParams.put("languageView", "ko");
            paymentParams.put("returnUrl", INICIS_RETURN_URL);
            paymentParams.put("closeUrl", INICIS_CANCEL_URL);
            paymentParams.put("acceptmethod", "BILLAUTH(Card)");

            // 디버깅 정보
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("signKey", signKey);
            debugInfo.put("timestamp", timestamp);
            debugInfo.put("signString", signString);
            debugInfo.put("verificationString", verificationString);
            debugInfo.put("signature", signature);
            debugInfo.put("verification", verification);
            debugInfo.put("mKey", signKey);
            debugInfo.put("paymentParams", paymentParams);

            log.info("🔍 [빌링키 디버깅] 완료");
            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            log.error("❌ [빌링키 디버깅] 오류 발생", e);
            return ResponseEntity.status(500).body("디버깅 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 프론트엔드 테스트용 간단한 결제 파라미터 생성
     */
    @PostMapping("/billing/test")
    public ResponseEntity<InicisBillingCreateResponseDTO> createTestBillingKey(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody(required = false) Map<String, Object> request) {
        try {
            log.info("🧪 [테스트 빌링키 발급] 요청 시작");
            log.info("🧪 [테스트 빌링키 발급] 요청 데이터: {}", request);
            
            // 기본 테스트 데이터
            String mid = INICIS_MID;
            String oid = "TEST_" + System.currentTimeMillis();
            String price = "1000";
            String goodname = "테스트상품";
            String buyername = "테스터";
            String buyertel = "01012345678";
            String buyeremail = "test@test.com";
            String languageView = "ko";
            
            // 요청에서 데이터가 있으면 덮어쓰기
            if (request != null) {
                if (request.get("price") != null) price = String.valueOf(request.get("price"));
                if (request.get("goodname") != null) goodname = String.valueOf(request.get("goodname"));
                if (request.get("buyername") != null) buyername = String.valueOf(request.get("buyername"));
                if (request.get("buyertel") != null) buyertel = String.valueOf(request.get("buyertel"));
                if (request.get("buyeremail") != null) buyeremail = String.valueOf(request.get("buyeremail"));
                if (request.get("languageView") != null) languageView = String.valueOf(request.get("languageView"));
            }

            log.info("🧪 [테스트 빌링키 발급] 최종 파라미터:");
            log.info("  - mid: {}", mid);
            log.info("  - oid: {}", oid);
            log.info("  - price: {}", price);
            log.info("  - goodname: {}", goodname);
            log.info("  - buyername: {}", buyername);
            log.info("  - buyertel: {}", buyertel);
            log.info("  - buyeremail: {}", buyeremail);
            log.info("  - languageView: {}", languageView);

            // 이니시스 설정
            String signKey = INICIS_SIGN_KEY;
            String timestamp = String.valueOf(System.currentTimeMillis());
            
            // signature 생성
            Map<String, String> signParam = new HashMap<>();
            signParam.put("oid", oid);
            signParam.put("price", price);
            signParam.put("timestamp", timestamp);
            
            String signString = signParam.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
            
            String signature = generateSHA256(signString).toLowerCase();
            
            // verification 생성
            Map<String, String> verificationParam = new HashMap<>(signParam);
            verificationParam.put("signKey", signKey);
            
            String verificationString = verificationParam.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
            
            String verification = generateSHA256(verificationString).toLowerCase();

            // 이니시스 결제창 파라미터
            Map<String, String> paymentParams = new HashMap<>();
            paymentParams.put("version", "1.0");
            paymentParams.put("gopaymethod", "");
            paymentParams.put("mid", mid);
            paymentParams.put("oid", oid);
            paymentParams.put("price", price);
            paymentParams.put("timestamp", timestamp);
            paymentParams.put("use_chkfake", "Y");
            paymentParams.put("signature", signature);
            paymentParams.put("verification", verification);
            paymentParams.put("mKey", signKey);
            paymentParams.put("offerPeriod", "Y2");
            paymentParams.put("charset", "UTF-8");
            paymentParams.put("currency", "WON");
            paymentParams.put("goodname", goodname);
            paymentParams.put("buyername", buyername);
            paymentParams.put("buyertel", buyertel);
            paymentParams.put("buyeremail", buyeremail);
            paymentParams.put("languageView", languageView);
            paymentParams.put("returnUrl", INICIS_RETURN_URL);
            paymentParams.put("closeUrl", INICIS_CANCEL_URL);
            paymentParams.put("acceptmethod", "BILLAUTH(Card)");

            log.info("🧪 [테스트 빌링키 발급] 성공 - 결제 파라미터 생성됨");

            return ResponseEntity.ok(new InicisBillingCreateResponseDTO(
                true, null, paymentParams
            ));

        } catch (Exception e) {
            log.error("❌ [테스트 빌링키 발급] 오류 발생", e);
            return ResponseEntity.status(500).body(new InicisBillingCreateResponseDTO(
                false, "서버 오류가 발생했습니다.", null
            ));
        }
    }

    /**
     * 프론트엔드 테스트용 간단한 결제 결과 수신
     */
    @PostMapping("/return-test")
    public ResponseEntity<?> handleReturnTest(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody(required = false) Map<String, Object> resultData) {
        try {
            log.info("🧪 [테스트 Return] 결제 결과 수신 시작");
            log.info("🧪 [테스트 Return] 받은 데이터: {}", resultData);
            
            // 간단한 응답 처리
            if (resultData != null && !resultData.isEmpty()) {
                String resultCode = (String) resultData.get("resultCode");
                boolean isSuccess = "0000".equals(resultCode);
                
                if (isSuccess) {
                    log.info("✅ [테스트 Return] 결제 성공");
                    return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "테스트 결제가 성공적으로 처리되었습니다.",
                        "data", resultData
                    ));
                } else {
                    log.warn("❌ [테스트 Return] 결제 실패 - resultCode: {}", resultCode);
                    return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "테스트 결제에 실패했습니다.",
                        "data", resultData
                    ));
                }
            } else {
                log.warn("❌ [테스트 Return] 결제 데이터가 없습니다.");
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "결제 데이터가 없습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("❌ [테스트 Return] 처리 중 예외 발생", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "테스트 결제 결과 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 프론트엔드에서 필요한 이니시스 설정값 조회
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getInicisConfig(@PathVariable("rprsOgnzNo") String rprsOgnzNo) {
        try {
            log.info("⚙️ [이니시스 설정] 프론트엔드 설정값 요청");
            
            Map<String, String> config = new HashMap<>();
            config.put("mid", INICIS_MID);
            config.put("mKey", INICIS_MKEY);
            config.put("returnUrl", INICIS_RETURN_URL);
            config.put("cancelUrl", INICIS_CANCEL_URL);
            
            log.info("⚙️ [이니시스 설정] 설정값 반환: {}", config);
            
            return ResponseEntity.ok(config);
            
        } catch (Exception e) {
            log.error("❌ [이니시스 설정] 설정값 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(Map.of("error", "설정값 조회 중 오류가 발생했습니다."));
        }
    }
}
