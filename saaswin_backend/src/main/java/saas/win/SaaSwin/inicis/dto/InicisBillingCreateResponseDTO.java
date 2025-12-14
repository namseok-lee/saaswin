package saas.win.SaaSwin.inicis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * 새로운 빌링키 발급 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InicisBillingCreateResponseDTO {
    
    private boolean success;          // 성공 여부
    private String message;           // 메시지 (실패 시)
    private Map<String, String> data; // 결제 파라미터 (프론트엔드에서 data로 접근)
} 