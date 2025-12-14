package saas.win.SaaSwin.navermap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GeocodingResponseDTO {
    private String x; // 경도
    private String y; // 위도
}
