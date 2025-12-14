package saas.win.SaaSwin.inicis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 이니시스 빌링키 발급 요청 DTO (STEP 1: 인증요청)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InicisBillingRequestDTO {
    
    // 공통 필수 파라미터
    private String version;           // 전문 버전 ["1.0" 고정]
    private String gopaymethod;       // 요청지불수단 (빈값)
    private String mid;               // 상점아이디
    private String oid;               // 주문번호 (Unique)
    private String price;             // 결제금액
    private String timestamp;         // 타임스탬프
    private String use_chkfake;       // PC결제 보안강화 ["Y" 고정]
    private String signature;         // SHA256 Hash값 (oid + price + timestamp + signKey)
    private String verification;      // SHA256 Hash값 (oid + price + signKey + timestamp)
    private String mKey;              // SHA256 Hash값 (signKey)
    private String charset;           // 결과 수신 인코딩 [UTF-8]
    private String currency;          // 통화구분 ["WON"]
    private String goodname;          // 상품명
    private String buyername;         // 구매자명
    private String buyertel;          // 구매자 휴대폰번호
    private String buyeremail;        // 구매자 이메일주소
    private String returnUrl;         // 결과수신 URL
    private String closeUrl;          // 결제창 닫기 URL
    
    // 빌링키 발급 전용 파라미터
    private String acceptmethod;      // BILLAUTH(Card):CLOSE
    private String offerPeriod;       // 제공기간 [Y2:연 자동결제, M2:월 자동결제]
    private String billkeyReg;        // 빌링키 등록 요청 ["Y"]
    
    // 선택 파라미터
    private String hidebillprice;     // 신용카드 빌키발급 시 금액미노출 옵션
    private String below1000;         // 1000원 이하금액 결제가능 옵션
    private String centerCd;          // IDC센터코드 수신 사용옵션
} 