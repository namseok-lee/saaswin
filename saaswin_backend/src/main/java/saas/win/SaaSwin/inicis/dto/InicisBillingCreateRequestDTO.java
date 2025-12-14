package saas.win.SaaSwin.inicis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 새로운 빌링키 발급 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InicisBillingCreateRequestDTO {
    
    private String mid;               // 상점아이디 (기본값: INIBillTst)
    private String oid;               // 주문번호 (선택적 - 없으면 자동 생성)
    private String price;             // 결제금액 (기본값: 1000)
    private String goodname;          // 상품명 (기본값: 테스트상품)
    private String buyername;         // 구매자명 (기본값: 테스터)
    private String buyertel;          // 구매자 휴대폰번호 (기본값: 01012345678)
    private String buyeremail;        // 구매자 이메일주소 (기본값: test@test.com)
    private String languageView;      // 언어 설정 (기본값: ko)
} 