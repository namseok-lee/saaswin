package saas.win.SaaSwin.sql.command.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SqlDTO {

    private int sql_no;
    private String scr_no;
    private int scr_prord;
    private String sql_info1;
    private List<Map<String, Object>> vrbl_info1;
    private String sql_info2;
    private List<Map<String, Object>> vrbl_info2;
    private String sql_info3;
    private List<Map<String, Object>> vrbl_info3;
    private Map<String, Object> sys_col_info;

//    private int queryDefId;
//    private String sqlId;
//    private String queryString;
//    private String useYn;
//    private String status;
//    private List<SqlParamsDTO> params;
}
