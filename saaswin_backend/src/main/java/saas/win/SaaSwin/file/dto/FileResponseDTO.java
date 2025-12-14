package saas.win.SaaSwin.file.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Data
public class FileResponseDTO {
    private String file_mng_no;
    private String orgnfl_nm;
    private String orgnfl_extn_nm;
    private int orgnfl_sz;
    private String encpt_nm;
    private String uld_ymd;
    private String uld_tm;
    private String path_nm;
    private MultipartFile file;
}
