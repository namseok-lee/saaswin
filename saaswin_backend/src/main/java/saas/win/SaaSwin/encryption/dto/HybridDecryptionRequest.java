package saas.win.SaaSwin.encryption.dto;

import lombok.Data;

@Data
public class HybridDecryptionRequest {
    private String encryptedData; // AES로 암호화된 실제 데이터 (Base64)
    private String encryptedAesKey; // RSA로 암호화된 AES 키 (Base64)
    private String iv; // AES CBC 모드용 초기화 벡터 (Base64)
    private String userNo; // 사용자 번호 (이제 바디에 포함)
    // userNo가 필요하다면 여기에 추가하거나 @RequestParam으로 유지
}