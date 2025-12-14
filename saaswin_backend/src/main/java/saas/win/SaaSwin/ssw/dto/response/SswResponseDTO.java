package saas.win.SaaSwin.ssw.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class SswResponseDTO {
    private String rtnCode;
    private String rtnMsg;
    private List<SswResponseDataDTO> resData;
}
