package saas.win.SaaSwin.inicis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 승인요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InicisApproveRequestDTO {
    
    private String mid;             // 가맹점 아이디
    private String authToken;       // 승인요청 검증 토큰   
    private String timestamp;       // 타임스탬프
    private String signature;       // 해시값 : authToken + timestamp 
    private String verification;    // 검증값 : authToken + signKey + timestamp
    private String charset;         // 인증결과 인코딩
    private String format;          // 리턴형식 : XML, JSON, NVP
    private String price;           // 인증가격 (옵션)
    private String resultLanguage;  // 승인 응답 시 resultMsg 언어 설정 (옵션) : ENG, CHI, Default(국문)

}
