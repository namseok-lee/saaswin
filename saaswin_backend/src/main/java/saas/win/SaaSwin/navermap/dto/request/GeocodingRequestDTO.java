package saas.win.SaaSwin.navermap.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class GeocodingRequestDTO {
    private String query; // 검색할 주소
}
