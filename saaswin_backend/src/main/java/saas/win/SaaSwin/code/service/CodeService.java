package saas.win.SaaSwin.code.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.code.dto.CodeDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;

import java.sql.SQLException;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class CodeService {

    private final SqlService sqlService;

    private final RedisTemplate<String, Object> redisTemplate;

    public SswResponseDTO search(@RequestBody CodeDTO dto) throws ParseException, SQLException, JsonProcessingException {

        List<SswResponseDataDTO> resList = new ArrayList<SswResponseDataDTO>();

        // 0. useYN이 없다면 기본값은 Y 로 넣음
        if(dto.getUse_yn() == null || "".equals(dto.getUse_yn())) {
            dto.setUse_yn("Y");
        }

        // 0. 시작종료일 없다면 현재로 넣어줌 YYYYMMDD
        if(dto.getSearch_ymd() == null || "".equals(dto.getSearch_ymd())) {
            LocalDate currentDate = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
            dto.setSearch_ymd(currentDate.format(formatter));
        }

        // 1. redis에서 조회
        List<Map<String, Object>> filteredList = new ArrayList<>();

        Object json = redisTemplate.opsForValue().get(dto.getRprs_ognz_no() + "_" + dto.getGroup_cd()); //(cmcd 삭제 요청으로 일단 변경 :한경)
//        Object json = redisTemplate.opsForValue().get(SqlConstants.COMMON_CODE_START_STRING + dto.getRprs_ognz_no() + "_" + dto.getGroup_cd());
        if(json != null && !StringUtils.isBlank((String)json)) {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> codeList = objectMapper.readValue((String)json, List.class);

            // 2. 사용여부 , 기간 , 회사코드로 filter
            for (Map<String, Object> code : codeList) {
                String useYn = (String) code.get("use_yn");
                String bgngYmd = (String) code.get("bgng_ymd");
                String endYmd = (String) code.get("end_ymd");
                String rprsOgnzNo = (String) code.get("rprs_ognz_no");

                if (dto.getUse_yn().equals(useYn)
                        && rprsOgnzNo != null && rprsOgnzNo.contains(dto.getRprs_ognz_no())
                        && bgngYmd != null && endYmd != null
                        && bgngYmd.compareTo(dto.getSearch_ymd()) <= 0
                        && endYmd.compareTo(dto.getSearch_ymd()) >= 0) {
                    filteredList.add(code);
                }
            }
        }

        dto.setRprs_ognz_no(SqlConstants.COMMON_CODE_COMMON_STRING1);
        Object json2 = redisTemplate.opsForValue().get(dto.getRprs_ognz_no() + "_" + dto.getGroup_cd());
        if(json2 != null && !StringUtils.isBlank((String)json2)) {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> codeList = objectMapper.readValue((String)json2, List.class);

            // 2. 사용여부 , 기간 , 회사코드로 filter
            for (Map<String, Object> code : codeList) {
                String useYn = (String) code.get("use_yn");
                String bgngYmd = (String) code.get("bgng_ymd");
                String endYmd = (String) code.get("end_ymd");
                String rprsOgnzNo = (String) code.get("rprs_ognz_no");

                if (dto.getUse_yn().equals(useYn)
                        && rprsOgnzNo != null && rprsOgnzNo.contains(dto.getRprs_ognz_no())
                        && bgngYmd != null && endYmd != null
                        && bgngYmd.compareTo(dto.getSearch_ymd()) <= 0
                        && endYmd.compareTo(dto.getSearch_ymd()) >= 0) {
                    filteredList.add(code);
                }
            }
        }

        SswResponseDataDTO resDto = new SswResponseDataDTO();
        resDto.setSqlId(0);
        if(filteredList.size() > 0) {
            ObjectMapper objectMapper = new ObjectMapper();
            resDto.setData(objectMapper.convertValue(filteredList.get(0).get("com_cd_info"), List.class));
        }
        resList.add(resDto);

        SswResponseDTO result = new SswResponseDTO();
        result.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
        result.setResData(resList);

        return result;

    }

    public SswResponseDTO reset(@RequestBody CodeDTO dto) throws ParseException, SQLException, JsonProcessingException {

        List<SswResponseDataDTO> resList = new ArrayList<SswResponseDataDTO>();

        // 1. 기존 redis에 있는 공통코드들 전부 삭제 (cmcd_ 로 시작하는것들 모두 삭제)
        // 하나씩 처리 - 안정적
//        ScanOptions options = ScanOptions.scanOptions().match("cmcd_*").build();
//        Cursor<byte[]> cursor = redisTemplate.getConnectionFactory().getConnection().scan(options);
//        while (cursor.hasNext()) {
//            String key = new String(cursor.next());
//            redisTemplate.delete(key);  // Delete the key
//        }
        // 한방에 처리 - 성능문제있을수있음. 그러나 거의일어나지않는 일이기때문에 이것으로처리
        Set<String> keys = redisTemplate.keys("*"); // 모든 키를 가져옴 (cmcd 삭제 요청으로 일단 변경 :한경)
//        Set<String> keys = redisTemplate.keys(SqlConstants.COMMON_CODE_START_STRING + "*"); // "cmcd_*" 패턴에 맞는 모든 키를 가져옴
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);  // 가져온 키들을 한 번에 삭제
        }

        // 2. 기존 db에 있는 공통코드들 조회
        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(SqlConstants.COMMON_CODE_SQL_ID_01);
        List<Map<String, Object>> queryList = sqlService.executeQuery_select(sqlDto);
        List<Map<String, Object>> codeList = (List<Map<String, Object>>)(queryList.get(0).get("data"));

        // 3. redis에 set
        for (Map<String, Object> code : codeList) {
            ObjectMapper objectMapper = new ObjectMapper();
            String json = objectMapper.writeValueAsString((List<Map<String,Object>>) code.get("data"));
            String rprs_ognz_no = String.valueOf( ((List<Map<String,Object>>) code.get("data")).get(0).get("rprs_ognz_no") );
            redisTemplate.opsForValue().set(rprs_ognz_no + "_" + String.valueOf(code.get("group_cd")), json); //(cmcd 삭제 요청으로 일단 변경 :한경)
//            redisTemplate.opsForValue().set(SqlConstants.COMMON_CODE_START_STRING + rprs_ognz_no + "_" + String.valueOf(code.get("group_cd")), json);
        }

        SswResponseDTO result = new SswResponseDTO();
        result.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
        result.setResData(null);

        return result;
    }


    /*
    //redisTemplate.opsForValue().set(key, value);
    //(String) redisTemplate.opsForValue().get(key);
    //redisTemplate.delete(key);

    // SCAN 명령어로 패턴에 맞는 키 검색
    ScanOptions options = ScanOptions.scanOptions().match("cm_*").count(10000).build();
    Cursor<byte[]> cursor = redisTemplate.executeWithStickyConnection(redisConnection -> redisConnection.scan(options));
    // 결과를 처리하는 코드
    while (cursor.hasNext()) {
        String key = new String(cursor.next());
        System.out.println("Found key: " + key);
    }
    */
}
