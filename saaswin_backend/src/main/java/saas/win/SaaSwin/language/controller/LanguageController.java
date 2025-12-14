package saas.win.SaaSwin.language.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Description;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.util.SswUtils;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class LanguageController {

    private final SqlService sqlService;

    @Operation(summary = "다국어 가져오기", description = "다국어 가져오기")
    @Description("다국어 가져오기")
    @GetMapping("/api/language/{language}.json")
    public Map<String, String> getLanguageMessages(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @PathVariable String language) throws ParseException {

        // 파라미터로받은 언어로 데이터 조회
//        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
//        Map<String, Object> param = new HashMap<String, Object>();
//        param.put("language", language);
//        param.put("redis_ver", redis_ver);
//        params.add(param);

        SswRequestSqlDTO paramDto = new SswRequestSqlDTO();
        paramDto.setSqlId(SqlConstants.REDIS_SQL_LNG_01);
        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();

        Map<String, Object> objParam = new HashMap<String, Object>();
        objParam.put("lng_key", language);
        objParam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_LNG_KEY_01);
        objParams.add(objParam);
        paramDto.setParams(objParams);
        List<Map<String, Object>> objList = sqlService.executeQuery_select_for_func(paramDto);

        Map<String, String> returnObjList = (Map<String, String>) ((Map)((Map) objList.get(0).get("data")).get("data")).get("data");

        return returnObjList;
        // key value map으로 변경
//        return messages.stream()
//                .collect(Collectors.toMap(
//                        message -> String.valueOf(message.get("mnl_no")),  // "messageKey"를 키로 사용
//                        message -> String.valueOf(message.get("lang_nm")) // "messageValue"를 값으로 사용
//                ));
    }

    @Operation(summary = "다국어 버전 조회", description = "다국어 데이터의 버전 정보 조회")
    @Description("다국어 버전 조회")
    @GetMapping("/api/language/version")
    public Map<String, String> getLanguageVersion(@PathVariable("rprsOgnzNo") String rprsOgnzNo) throws ParseException {
        SswRequestSqlDTO paramDto = new SswRequestSqlDTO();
        paramDto.setSqlId(SqlConstants.REDIS_SQL_LNG_01);
        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();
        
        Map<String, Object> objParam = new HashMap<String, Object>();
        objParam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_LNG_KEY_02);
        objParams.add(objParam);
        paramDto.setParams(objParams);
        
        List<Map<String, Object>> objList = sqlService.executeQuery_select_for_func(paramDto);
        
        // 버전 정보 생성 (마지막 업데이트 시간 또는 해시값)
        Map<String, String> versionInfo = new HashMap<>();
        versionInfo.put("version", UUID.randomUUID().toString());
        versionInfo.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return versionInfo;
    }

}
