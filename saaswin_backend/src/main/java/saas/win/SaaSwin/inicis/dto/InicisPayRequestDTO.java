package saas.win.SaaSwin.inicis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 인증 코드 검증을 위한 결제 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InicisPayRequestDTO {

    private String mid;         // 상점아이디
    private String oid;         // 주문번호
    private Long timestamp;     // 타임스탬프(밀리초)
    private String signature;   // sha256 해시값 (oid + price + timestamp)
    private String verification; // sha256 해시값 (oid + price + singKey + timestamp)
    @JsonProperty("mKey")
    private String mKey;        // sha256 해시값(mid)
    private String returnUrl;   // 결제 성공 후 리다이렉트 URL
    private String closeUrl;    // 결제창 닫기 후 리다이렉트 URL
    private String billkeyReg;     
    // 화면에서 보내는 값
    private String version;
    private String gopaymethod; // 요청지불수단
    private String use_chkfake; // PC결제 보안강화 사용 ["Y" 고정]
    private String currency; // 통화구분
    private String goodname; // 상품명
    private String buyername; // 구매자명
    private String price; // 결제금액
    private String buyertel; // 구매자 휴대폰번호
    private String buyeremail; // 구매자 이메일주소
    private String languageView; // 언어설정
    
    private String acceptmethod; 
} 