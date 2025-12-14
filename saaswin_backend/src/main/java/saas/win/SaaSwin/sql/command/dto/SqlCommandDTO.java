package saas.win.SaaSwin.sql.command.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * bean으로 생성하여 static처럼 관리.
 * sql을 그때마다 db에서 불러오지않고 메모리에 넣어놓고 사용하도록 함
 */
public class SqlCommandDTO {

    // bean내에서 생성하여 최초에 비어있는 sqlList를 생성함
    public static List<SqlDTO> sqlList;

    public static String getSqlQuery = "select sql_no\n" +
                                       "     , scr_no\n" +
                                       "     , scr_prord\n" +
                                       "     , sql_info1\n" +
                                       "     , vrbl_info1\n" +
                                       "     , sql_info2\n" +
                                       "     , vrbl_info2\n" +
                                       "     , sql_info3\n" +
                                       "     , vrbl_info3\n" +
                                       "     , sys_col_info\n" +
                                       "  from bak_tsm_sql\n" +
                                       " where sql_no = ?";

}
