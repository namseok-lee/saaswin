package saas.win.SaaSwin.ssw.dto.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SswResponseDataDTO {
    private Object sqlId;
    private List<Map<String, Object>> data;
    private int rntRowCnt;
}
