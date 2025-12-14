package saas.win.SaaSwin.sql.command.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import com.zaxxer.hikari.HikariDataSource;

import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.postgresql.util.PGobject;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.snsLogin.common.service.CommonQueryService;
import saas.win.SaaSwin.sql.command.dto.SqlCommandDTO;
import saas.win.SaaSwin.sql.command.dto.SqlDTO;
import saas.win.SaaSwin.sql.command.dto.SqlParamsDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestObjectDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.util.SqlCommandUtils;
import saas.win.SaaSwin.util.SswUtils;

import javax.sql.DataSource;
import java.lang.reflect.Type;
import java.sql.*;
import java.text.ParseException;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class SqlService {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate; // datasource말고 이거쓰면 좀더 간편
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public List<Map<String, Object>> executeQuery_common_save(SswRequestSqlDTO dto) throws ParseException, SQLException {

        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
        SqlDTO sqlDto = getSql( Integer.parseInt(String.valueOf(dto.getSqlId())) );

        for (Map<String, Object> param : dto.getParams()) {

            // 파라미터 설정
            MapSqlParameterSource params = new MapSqlParameterSource();

            for (Map<String, Object> sql : sqlDto.getVrbl_info1()) {
                Set<String> keys = param.keySet();
                if (keys.contains(String.valueOf(sql.get("nm")))) {
                    String paramName = String.valueOf(sql.get("nm"));
                    Object paramValue = param.get(paramName);

                    switch (String.valueOf(sql.get("type"))) {
                        case SqlConstants.NUMBER:
                            params.addValue(paramName, Integer.parseInt(String.valueOf(paramValue)));
                            break;
                        case SqlConstants.LONG:
                            params.addValue(paramName, Long.parseLong(String.valueOf(paramValue)));
                            break;
                        case SqlConstants.DATE:
                            params.addValue(paramName, SswUtils.getTimestamp(String.valueOf(paramValue)));
                            break;
                        case SqlConstants.JSONB:
                            // JSON 처리
                            String jsonStr = "";
                            ObjectMapper objectMapper = new ObjectMapper();
                            try {
                                jsonStr = objectMapper.writeValueAsString(paramValue);
                            } catch (Exception e) {
                                log.error("Error", e);
                            }
                            params.addValue(paramName, (paramValue == null || "null".equals(paramValue)) ? null : jsonStr);
                            break;
                        case SqlConstants.VARCHAR:
                        case SqlConstants.VARCHAR2:
                        case SqlConstants.VACHAR2:
                        case SqlConstants.STRING:
                        default:
                            params.addValue(paramName, String.valueOf(paramValue));
                            break;
                    }
                }
            }

            String sqlQuery = sqlDto.getSql_info1();
            List<Map<String, Object>> result = namedParameterJdbcTemplate.queryForList(sqlQuery, params);

            for (Map<String, Object> row : result) {
                if (row.get("rtn_msg") != null) {
                    String rtn_msg = String.valueOf(row.get("rtn_msg"));

                    if (StringUtils.isBlank(rtn_msg)) {
                        return resultList;
                    }

                    // JSON 문자열을 List<Map<String, Object>>로 변환
                    ObjectMapper objectMapper = new ObjectMapper();
                    try {
                        List<Map<String, Object>> list = objectMapper.readValue(rtn_msg, new TypeReference<List<Map<String, Object>>>() {
                        });
                        resultList.addAll(list);
                    } catch (JsonMappingException e) {
                        throw new RuntimeException(e);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                }

                if (row.get("data") != null) {
                    String rtn_msg = String.valueOf(row.get("data"));

                    if (StringUtils.isBlank(rtn_msg)) {
                        return resultList;
                    }

                    // JSON 문자열을 List<Map<String, Object>>로 변환
                    ObjectMapper objectMapper = new ObjectMapper();
                    try {
                        List<Map<String, Object>> list = objectMapper.readValue(rtn_msg, new TypeReference<List<Map<String, Object>>>() {
                        });
                        resultList.addAll(list);
                    } catch (JsonMappingException e) {
                        throw new RuntimeException(e);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                }
            }

        }

        return resultList;
    }

    // sql 호출 - SqlId
    public List<Map<String, Object>> executeQuery_common_save_backup(SswRequestSqlDTO dto) throws ParseException, SQLException {

        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
        SqlDTO sqlDto = getSql( Integer.parseInt(String.valueOf(dto.getSqlId())) );

        for (Map<String, Object> param : dto.getParams()) {

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement pstmt = connection.prepareStatement(sqlDto.getSql_info1())) {
                for (Map<String, Object> sql : sqlDto.getVrbl_info1()) {
                    Set<String> keys = param.keySet();
                    if (keys.contains(String.valueOf(sql.get("nm")))) {
                        switch (String.valueOf(sql.get("type"))) {
                            case SqlConstants.NUMBER:
                                pstmt.setInt(Integer.parseInt(String.valueOf(sql.get("seq"))), Integer.parseInt(String.valueOf(param.get(sql.get("nm")))));
                                break;
                            case SqlConstants.LONG:
                                pstmt.setLong(Integer.parseInt(String.valueOf(sql.get("seq"))), Long.parseLong(String.valueOf(param.get(sql.get("nm")))));
                                break;
                            case SqlConstants.DATE:
                                pstmt.setTimestamp(Integer.parseInt(String.valueOf(sql.get("seq"))), SswUtils.getTimestamp(String.valueOf(param.get(sql.get("nm")))));
                                break;
                            case SqlConstants.JSONB:
                                // ObjectMapper 사용하여 JSON 문자열로 변환
                                String jsonStr = "";
                                ObjectMapper objectMapper = new ObjectMapper();
                                try {
                                    jsonStr = objectMapper.writeValueAsString(param.get(sql.get("nm")));
                                } catch (Exception e) {
                                    log.error("error", e);
                                }
                                pstmt.setString(Integer.parseInt(String.valueOf(sql.get("seq"))), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : jsonStr );

                                break;
                            case SqlConstants.VARCHAR:
                            case SqlConstants.VARCHAR2:
                            case SqlConstants.VACHAR2:
                            case SqlConstants.STRING:
                            default:
                                pstmt.setString(Integer.parseInt(String.valueOf(sql.get("seq"))), String.valueOf(param.get(sql.get("nm"))));
                                break;
                        }
                    }
                }

                try(ResultSet rs = pstmt.executeQuery()) {
                    ResultSetMetaData metaData = rs.getMetaData();
                    while (rs.next()) {
                        String rtn_msg = rs.getString("rtn_msg");

                        if(StringUtils.isBlank(rtn_msg)) {
                            return resultList;
                        }

                        //json string 을 list map으로 변환하여 담음
                        ObjectMapper objectMapper = new ObjectMapper();

                        try {
                            // JSON 문자열을 List<Map<String, Object>>로 변환
                            List<Map<String, Object>> list = objectMapper.readValue(rtn_msg, new TypeReference<List<Map<String, Object>>>() {});
                            resultList.addAll(list); // 결과
                        } catch (JsonMappingException e) {
                            throw new RuntimeException(e);
                        } catch (JsonProcessingException e) {
                            throw new RuntimeException(e);
                        }

                    }
                }
                catch (SQLException e) {
                    log.error("sql error", e);
                    throw new SQLException(e);
                }

            } catch (SQLException e) {
                log.error("sql error", e);
                throw new SQLException(e);
            }
        }

        return resultList;
    }

    // sql 호출 - SqlId
    public List<Map<String, Object>> executeQuery_select(SswRequestSqlDTO dto) throws ParseException {

        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
        SqlDTO sqlDto = getSql( Integer.parseInt(String.valueOf(dto.getSqlId())) );

        // sql자체가 파라미터 없을 때
        if(sqlDto.getVrbl_info1() == null || sqlDto.getVrbl_info1().size() == 0) {
            List<Map<String, Object>> tempList = namedParameterJdbcTemplate.queryForList(sqlDto.getSql_info1(), Collections.emptyMap());

            // jsonb type이 있다면 list map 형태로 만들어서 리턴
            resultList = SqlCommandUtils.preprocessJsonbFields(tempList);
            return resultList;
        }


        // sql의 tsm_sql의 vrbl_info1 이 jsonb인데 같은이름의 정보 찾아서 넣어줘야함
        for (Map<String, Object> param : dto.getParams()) {
            Map<String, Object> makeSqlParam = new HashMap<String, Object>();
            for (Map<String, Object> sql : sqlDto.getVrbl_info1()) {
                Set<String> keys = param.keySet();

                if (keys.contains(String.valueOf(sql.get("nm")))) {
                    switch (String.valueOf(sql.get("type"))) {
                        case SqlConstants.NUMBER:
                            makeSqlParam.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : Integer.parseInt(String.valueOf(param.get(sql.get("nm")))));
                            break;
                        case SqlConstants.LONG:
                            makeSqlParam.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : Long.parseLong(String.valueOf(param.get(sql.get("nm")))));
                            break;
                        case SqlConstants.DATE:
                            makeSqlParam.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : SswUtils.getTimestamp(String.valueOf(param.get(sql.get("nm")))));
                            break;
                        case SqlConstants.JSONB:
//                            Gson gson = new Gson();
//                            String jsonStr = gson.toJson(String.valueOf(param.get(sql.get("nm"))));
//                            param.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : jsonStr );
//
                            // ObjectMapper 사용하여 JSON 문자열로 변환
                            String jsonStr = "";
                            ObjectMapper objectMapper = new ObjectMapper();
                            try {
                                jsonStr = objectMapper.writeValueAsString(param.get(sql.get("nm")));
                            } catch (Exception e) {
                                log.error("error", e);
                            }
                            makeSqlParam.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : jsonStr );

                            break;
                        case SqlConstants.VARCHAR:
                        case SqlConstants.VARCHAR2:
                        case SqlConstants.VACHAR2:
                        case SqlConstants.STRING:
                        default:
                            makeSqlParam.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : String.valueOf(param.get(sql.get("nm"))));
                            break;
                    }
                }
                else {
                    makeSqlParam.put(String.valueOf(sql.get("nm")), null);
                }
            }


            List<Map<String, Object>> tempList = namedParameterJdbcTemplate.queryForList(sqlDto.getSql_info1(), makeSqlParam);

            // jsonb type이 있다면 list map 형태로 만들어서 리턴
            resultList = SqlCommandUtils.preprocessJsonbFields(tempList);
        }


            // sql이 주소바인딩 (?)
//                for (Map<String, Object> param : dto.getParams()) {
//
//                    try (Connection connection = dataSource.getConnection();
//                         PreparedStatement pstmt = connection.prepareStatement(sqlDto.getQueryString())) {
//                        for (SqlParamsDTO sql : sqlDto.getParams()) {
//                            Set<String> keys = param.keySet();
//                            if (keys.contains(sql.getName())) {
//                                switch (sql.getType()) {
//                                    case SqlConstants.NUMBER:
//                                        pstmt.setInt(sql.getSeq(), Integer.parseInt(String.valueOf(param.get(sql.getName()))));
//                                        break;
//                                    case SqlConstants.LONG:
//                                        pstmt.setLong(sql.getSeq(), Long.parseLong(String.valueOf(param.get(sql.getName()))));
//                                        break;
//                                    case SqlConstants.DATE:
//                                        pstmt.setTimestamp(sql.getSeq(), SswUtils.getTimestamp(String.valueOf(param.get(sql.getName()))));
//                                        break;
//                                    case SqlConstants.VARCHAR:
//                                    case SqlConstants.VARCHAR2:
//                                    case SqlConstants.VACHAR2:
//                                    case SqlConstants.STRING:
//                                    default:
//                                        pstmt.setString(sql.getSeq(), String.valueOf(param.get(sql.getName())));
//                                        break;
//                                }
//                            }
//                        }
//
//                        ResultSet rs = pstmt.executeQuery();
//                        ResultSetMetaData metaData = rs.getMetaData();
//
//                        while (rs.next()) {
//                            Map<String, Object> row = new HashMap<>();
//                            // 열 수를 동적으로 가져와서 처리
//                            int columnCount = metaData.getColumnCount();
//                            for (int i = 1; i <= columnCount; i++) {
//                                String columnName = metaData.getColumnName(i); // 열 이름 가져오기
//                                Object value = rs.getObject(i); // 열 값 가져오기
//                                row.put(columnName.toLowerCase(), value); // 맵에 키-값 쌍 추가
//                            }
//                            resultList.add(row); // 결과
//                        }
//                    } catch (SQLException e) {
//                        e.printStackTrace();
//                    }
//                }
        return resultList;
    }

    // sql 호출 - SqlId
    public List<Map<String, Object>> executeQuery_select_for_func(SswRequestSqlDTO dto) throws ParseException {

        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();

        for (Map<String, Object> param : dto.getParams()) {

            // sql_key 추가 후 직렬화
            if(!StringUtils.isBlank(dto.getSql_key())) {
                param.put(SqlConstants.REDIS_SQL_KEY, dto.getSql_key());
            }

            // 파라미터 직렬화
            String jsonStr = "";
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                jsonStr = objectMapper.writeValueAsString(param);
            } catch (Exception e) {
                log.error("error", e);
            }

            // 함수명
            String funcName = SqlConstants.REDIS_SQL_START_WITH + dto.getSqlId() + SqlConstants.REDIS_SQL_END_WITH;
            // 파라미터
            Map<String, Object> makeSqlParam = new HashMap<String, Object>();
            makeSqlParam.put("p_com", jsonStr);

            List<Map<String, Object>> tempList = namedParameterJdbcTemplate.queryForList(funcName, makeSqlParam);

            // jsonb type이 있다면 list map 형태로 만들어서 리턴
            resultList = SqlCommandUtils.preprocessJsonbFields(tempList);
        }



        return resultList;
    }

    // sql 호출 - SqlId
    @Transactional
    public int executeQuery_save(SswRequestSqlDTO dto) throws ParseException {

        int resultCnt = 0;
        SqlDTO sqlDto = getSql( Integer.parseInt(String.valueOf(dto.getSqlId())) );

        for (Map<String, Object> param : dto.getParams()) {

            // sql의 tsm_sql의 vrbl_info1 이 jsonb인데 같은이름의 정보 찾아서 넣어줘야함
            for (Map<String, Object> sql : sqlDto.getVrbl_info1()) {
                Set<String> keys = param.keySet();

                if (keys.contains(String.valueOf(sql.get("nm")))) {
                    switch (String.valueOf(sql.get("type"))) {
                        case SqlConstants.NUMBER:
                            param.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : Integer.parseInt(String.valueOf(param.get(sql.get("nm")))));
                            break;
                        case SqlConstants.LONG:
                            param.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : Long.parseLong(String.valueOf(param.get(sql.get("nm")))));
                            break;
                        case SqlConstants.DATE:
                            param.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : SswUtils.getTimestamp(String.valueOf(param.get(sql.get("nm")))));
                            break;
                        case SqlConstants.JSONB:
//                            Gson gson = new Gson();
//                            String jsonStr = gson.toJson(String.valueOf(param.get(sql.get("nm"))));
//                            param.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : jsonStr );

                            String jsonStr = "";
                            ObjectMapper objectMapper = new ObjectMapper();
                            try {
                                jsonStr = objectMapper.writeValueAsString(param.get(sql.get("nm")));
                            } catch (Exception e) {
                                log.error("error", e);
                            }
                            param.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : jsonStr );

                            break;
                        case SqlConstants.VARCHAR:
                        case SqlConstants.VARCHAR2:
                        case SqlConstants.VACHAR2:
                        case SqlConstants.STRING:
                        default:
                            param.put(String.valueOf(sql.get("nm")), (param.get(sql.get("nm")) == null || "null".equals(param.get(sql.get("nm")))) ? null : String.valueOf(param.get(sql.get("nm"))));
                            break;
                    }
                }

            }

            resultCnt = namedParameterJdbcTemplate.update(sqlDto.getSql_info1(), param);

        }
        // sql자체가 파라미터 없을 때
        if(sqlDto.getVrbl_info1() == null || sqlDto.getVrbl_info1().size() == 0) {
            resultCnt = namedParameterJdbcTemplate.update(sqlDto.getSql_info1(), Collections.emptyMap());
        }

        return resultCnt;
    }


    // 공통코드그룹 가져오기
    public List<Map<String, Object>> getCmcdGroup(String groupCd) {
        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();

        //select saaswin_redis_getval_jsonb('COMGRP_hpm_group01017', 0) as data;

        // 파라미터
        Map<String, Object> makeSqlParam = new HashMap<String, Object>();
        makeSqlParam.put("p_com", groupCd);

        List<Map<String, Object>> tempList = namedParameterJdbcTemplate.queryForList(SqlConstants.COMMON_CODE_SQL, makeSqlParam);

        // jsonb type이 있다면 list map 형태로 만들어서 리턴
        resultList = SqlCommandUtils.preprocessJsonbFields(tempList);
        resultList = (List) ((Map)((List)resultList.get(0).get("data")).get(0)).get("com_cd_info");
        return resultList;
    }
    // 공통코드 가져오기
    public Map<String, Object> getCmcd(String cmcd) {
        Map<String, Object> result = new HashMap<String, Object>();

        // COMGRP를 붙이고 뒤에있는 cm0001 같은 실제 코드는 짜른 후 GROUP_CD를 구하여 GROUP 호출
        List<Map<String, Object>> groupCd = getCmcdGroup( SqlConstants.COMMON_CODE_COMMON_STRING1 + "_" + cmcd.substring(0, cmcd.lastIndexOf('_')));

        for (Map<String, Object> item : groupCd) {
            String comCd = (String) item.get("com_cd");
            if (cmcd.equals(comCd)) {
                return item;
            }
        }

        return result;
    }


    public SqlDTO getSql(int sqlId) {
        // 0.없으면 null로 리턴
        if(sqlId == 0) {
            return null;
        }

        if(SqlCommandDTO.sqlList == null) {
            SqlCommandDTO.sqlList = new ArrayList<SqlDTO>();
        }

        // 1.sqlid로 sql찾음
        SqlDTO dto = null;
        for (SqlDTO sql : SqlCommandDTO.sqlList) {
            if (sqlId == sql.getSql_no()) {
                dto = sql;
                break;
            }
        }
        if(dto != null) {
            return dto;
        }

        // 2.sql이 없다면 찾아서 넣어줌
        dto = findSql(sqlId);
        setSql(dto);
        return dto;
    }

    // sql찾기
    public SqlDTO findSql(int sqlId) {
        SqlDTO dto = new SqlDTO();

        // 1. sql문 , 정보
        String sqlQuery = SqlCommandDTO.getSqlQuery;
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sqlQuery)) {

            preparedStatement.setInt(1, sqlId);

            try(ResultSet rs = preparedStatement.executeQuery()) {
                while (rs.next()) {
                    dto.setSql_no(rs.getInt("sql_no"));
                    dto.setScr_no(rs.getString("scr_no"));
                    dto.setScr_prord(rs.getInt("scr_prord"));
                    dto.setSql_info1(rs.getString("sql_info1"));
                    dto.setVrbl_info1(convertPGobjectToListMap(rs.getObject("vrbl_info1")));
                    dto.setSql_info2(rs.getString("sql_info2"));
                    dto.setVrbl_info2(convertPGobjectToListMap(rs.getObject("vrbl_info2")));
                    dto.setSql_info3(rs.getString("sql_info3"));
                    dto.setVrbl_info3(convertPGobjectToListMap(rs.getObject("vrbl_info3")));
                }
            }
        } catch (SQLException e) {
            log.error("sql error", e);
        }

        return dto;
    }

    public void setSql(SqlDTO dto) {
        SqlCommandDTO.sqlList.add(dto);
    }


    /**
     * namedParameterJdbcTemplate.queryForList() 에서 HashMap의 Key를 전부 소문자로 치환
     * namedParameterJdbcTemplate.query() 에서 타는 메소드를 override하여 재구현
     * queryForList() 대신 query() 사용해야함
     */
    public List<Map<String, Object>> getLowerCaseKeysWithRowMapper(String sql, Map<String, Object> params) {

        RowMapper<Map<String, Object>> rowMapper = new RowMapper<Map<String, Object>>() {
            @Override
            public Map<String, Object> mapRow(ResultSet rs, int rowNum) throws SQLException {
                Map<String, Object> lowerCaseMap = new HashMap<>();
                int columnCount = rs.getMetaData().getColumnCount();

                for (int i = 1; i <= columnCount; i++) {
                    String columnName = rs.getMetaData().getColumnLabel(i).toLowerCase(); // 컬럼 이름을 소문자로 변환
                    Object value = rs.getObject(i);
                    lowerCaseMap.put(columnName, value);
                }

                return lowerCaseMap;
            }
        };

        // query 메서드로 데이터 조회 및 RowMapper 적용
        List<Map<String, Object>> lowerCaseRows = namedParameterJdbcTemplate.query(sql, params, rowMapper);

        return lowerCaseRows;
    }


    private List<Map<String, Object>> convertPGobjectToListMap(Object obj) {
        if (obj == null) return null;

        List<Map<String, Object>> result = null;
        //PGobject - jsonb - jsonarray 처리
        Gson gson = new Gson();
        String jsonString = ((PGobject) obj).getValue();
        try {
            JsonElement jsonElement = JsonParser.parseString(jsonString);
            Type listType = new TypeToken<List<Map<String, Object>>>() {
            }.getType();

            List<Map<String, Object>> parsedList = gson.fromJson(jsonElement, listType);
            result = parsedList;
        } catch (JsonSyntaxException e) {
            // Parsing failed, keep the original valueMap
            // processedMap.put(key, value);
            log.error("error", e);
        }
        return result;
    }
}
