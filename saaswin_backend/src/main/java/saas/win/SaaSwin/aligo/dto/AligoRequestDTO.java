package saas.win.SaaSwin.aligo.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AligoRequestDTO {
    private String nt_tmplt;
    private String scr_itg_no;
    private List<Map<String,String>> params;
}
