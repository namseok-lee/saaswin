package saas.win.SaaSwin.inicis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 인증response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InicisAuthResponseDTO {
   
    private String resultCode;         // 결과코드 0000:성공 이외는 실패
    private String resultMsg;          // 결과메시지   
    private String mid;                // 상점아이디
    private String orderNumber;        // 주문번호 (결제오청 시 세팅한 주문번호)
    private String authToken;          // 승인요청 검증토큰
    private String idc_name;           // IDC센터코드 (fc, ks, stg) --> 승인요청 시 authUrl과 비교검증 필요
    private String authUrl;            // 결제창 URL --> 해당 url로 HRRPS API Request 승인요청(POST) 이니시스 제공 승인 API가 맞는지 확인 필요
    private String netCancelUrl;       // 망취소요청 Url --> 승인요청 수 승인결과 수신 실패 / DB 저장 실패 시
    private String charset;            // 인증결과 인코딩 default : utf-8
    private String merchantData;       // 가맹점 임의 데이터  
    
}
