package saas.win.SaaSwin.encryption.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecryptionRequest {
    private String encryptedText; // Field name based on controller usage
}