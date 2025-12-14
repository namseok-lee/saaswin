package saas.win.SaaSwin.ssw.dto.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SswResponseObjectDTO {
    private String rtnCode;
    private String rtnMsg;
    //private List<SswResponseObjectDataDTO> resData;
    //private SswResponseObjectDataDTO resData;
    private Map<String, Object> resData;
}
