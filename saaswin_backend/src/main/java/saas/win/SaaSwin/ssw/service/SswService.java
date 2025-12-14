package saas.win.SaaSwin.ssw.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.snsLogin.common.service.CommonQueryService;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.keycloak.dto.KeycloakUpdatePasswordRequestDto;
import saas.win.SaaSwin.keycloak.service.KeycloakPasswordService;

import saas.win.SaaSwin.ssw.dto.request.SswRequestObjectDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.*;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.util.SqlCommandUtils;
import saas.win.SaaSwin.util.SswUtils;

import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class SswService {

    private final SqlService sqlService;
    private final KeycloakPasswordService keycloakPasswordService;

    public SswResponseObjectDTO ssw0001(@RequestBody SswRequestObjectDTO dto) throws ParseException, SQLException {

        SswResponseObjectDTO result = new SswResponseObjectDTO();

        // 0. 권한별 화면 조회
        // --> 권한기능 변경으로 해당 로직 X
        // Map<String, Object> scrList = getSswItgNoInfo(dto).get( 0);
        // String scrItgNo = scrList.get("scr_itg_no").toString();
        // dto.setScr_itg_no(scrItgNo);
        // dto.setScr_type_cd(scrItgNo);

        // 1. 화면정보 조회
        List<Map<String, Object>> objList = getSswObjectInfo_for_func(dto);

        // 2. 하위obj 정보가 있다면 하위정보 조회
        Map<String, Object> objInfo = objList.get(0);
        // Map<String, Object> objInfo = (Map)
        // ((List)((Map)(((List)((Map)objList.get(0).get("data")).get("data")).get(0))).get("data")).get(0);
        // Map<String, Object> objInfo = (Map) ((List)
        // objList.get(0).get("data")).get(0);

        // 2-1. 탭이 있는 경우
        if (objInfo.get("tab_info") != null) {
            ArrayList<Map<String, Object>> newTabList = new ArrayList<Map<String, Object>>();
            ArrayList<Map<String, Object>> tabList = ((ArrayList) objInfo.get("tab_info"));

            for (Map<String, Object> tabInfo : tabList) {
                SswRequestObjectDTO tabDto = new SswRequestObjectDTO();
                tabDto = SswUtils.convertMapToDTO(tabInfo, SswRequestObjectDTO.class);
                tabDto.setUser_no(dto.getUser_no());
                tabDto.setRprs_ognz_no(dto.getRprs_ognz_no());

                // String tabScrItgNo = String.valueOf(tabInfo.get("scr_itg_no"));
                // tabDto.setScr_itg_no(tabScrItgNo);
                // tabDto.setScr_type_cd(tabScrItgNo);

                // List<Map<String, Object>> tabSearchList = getSswObjectInfo(tabDto);

                List<Map<String, Object>> tabSearchList = getSswObjectInfo_for_func(tabDto);

                // Map<String, Object> tabObjInfo = (Map) ((List)
                // tabSearchList.get(0).get("data")).get(0);
                Map<String, Object> tabObjInfo = tabSearchList.get(0);

                // 탭에 하위그리드가 있을 경우
                if (tabObjInfo.get("data_se_info") != null) {
                    ArrayList<Map<String, Object>> newTabDataSeList = new ArrayList<Map<String, Object>>();
                    ArrayList<Map<String, Object>> TabDataSeList = ((ArrayList) tabObjInfo.get("data_se_info"));
                    for (Map<String, Object> tabDataSe : TabDataSeList) {

                        Map<String, Object> objParams = new HashMap<String, Object>();
                        // objParams.put("scr_itg_no", tabDto.getScr_itg_no());
                        objParams.put("scr_no", tabDto.getScr_no());
                        objParams.put("scr_prord", tabDto.getScr_prord());
                        objParams.put("data_se_cd", tabDataSe.get("grid_value"));
                        objParams.put("type", tabDataSe.get("type"));
                        objParams.put("user_no", dto.getUser_no());
                        objParams.put("rprs_ognz_no", dto.getRprs_ognz_no());
                        List<Map<String, Object>> TabDetailObjList = getSswDetailObjectInfo_for_func(objParams);

                        // 원래 데이터로 같은이름으로 넣어줌
                        TabDetailObjList.get(0).put("data_se_info", tabDataSe);

                        newTabDataSeList.addAll(TabDetailObjList);

                    }
                    // 새로운데이터로 교체
                    tabObjInfo.put("data_se_info", newTabDataSeList);
                }

                // 원래 데이터로 같은이름으로 넣어줌
                // tabSearchList.get(0).put("tab_info",tabInfo);
                // newTabList.addAll(tabSearchList);
                tabSearchList.get(0).put("tab_info", tabInfo);
                newTabList.addAll(tabSearchList);

            }

            objInfo.put("tab_info", newTabList);
        }

        // 2-2 하위그리드가 있는경우
        if (objInfo.get("data_se_info") != null) {
            ArrayList<Map<String, Object>> newDataSeList = new ArrayList<Map<String, Object>>();
            ArrayList<Map<String, Object>> dataSeList = ((ArrayList) objInfo.get("data_se_info"));
            for (Map<String, Object> dataSe : dataSeList) {
                String type = String.valueOf(dataSe.get("type"));

                Map<String, Object> params = new HashMap<>();
                Map<String, Object> objParams = new HashMap<String, Object>();
                objParams = SswUtils.convertDTOToMap(dto);
                objParams.put("data_se_cd", dataSe.get("grid_value"));
                objParams.put("type", dataSe.get("type"));
                List<Map<String, Object>> detailObjList = getSswDetailObjectInfo_for_func(objParams);

                // 원래 데이터로 같은이름으로 넣어줌
                detailObjList.get(0).put("data_se_info", dataSe);
                // detailObjList.get(0).put("data_se_info",dataSe);

                newDataSeList.addAll(detailObjList);
            }
            // 새로운데이터로 교체
            objInfo.put("data_se_info", newDataSeList);
        }

        result.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
        // result.setResData(objList.get(0));
        // result.setResData((Map) ((List) objList.get(0).get("data")).get(0));
        result.setResData(objList.get(0));

        return result;
    }

    /**
     * sql 호출 조회
     */
    @Transactional
    public SswResponseDTO ssw0002(@RequestBody List<SswRequestSqlDTO> dtoList, boolean isPipelineJson)
            throws ParseException {

        List<SswResponseDataDTO> resList = new ArrayList<SswResponseDataDTO>();

        // return cd 넣어줌
        String return_cd = "";
        String return_msg = "";
        try {
            for (SswRequestSqlDTO dto : dtoList) {
                List<Map<String, Object>> list = sqlService.executeQuery_select_for_func(dto);

                // full json 형식으로 만듬
                // 공통일 시, 0번째에 data만 존재하고 해당 data가 실제 데이터임
                List<Map<String, Object>> convertList = list;
                if (convertList != null && convertList.size() > 0 && convertList.get(0).get("data") != null) {

                    if (convertList.get(0).get("data") instanceof List) {
                        
                        convertList = (List) convertList.get(0).get("data");
                    } else if (convertList.get(0).get("data") instanceof Map) {
                        List<Map<String, Object>> convertList2 = new ArrayList<>();
                        convertList2.add((Map) convertList.get(0).get("data"));
                        convertList = convertList2;
                    }
                    if (convertList.get(0).get("return_cd") != null) {
                        return_cd = String.valueOf(convertList.get(0).get("return_cd"));
                    }
                }

                // db함수에서 오류시
                if (!return_cd.equals(SswConstants.RESULT_CODE_SUCCESS)) {
                    return_msg = String.valueOf(convertList.get(0).get("error_msg"));

                    SswResponseDTO result = new SswResponseDTO();
                    result.setRtnCode(return_cd);
                    result.setRtnMsg(return_msg);
                    result.setResData(resList);

                    return result;
                }

                // return_cd 와 data를 각각 따로 - return_cd는 판단하여 RtnCode와 RtnMsg에 넣음
                List dataList = null;
                if (convertList != null && !convertList.isEmpty() && convertList.get(0) instanceof Map) {
                    Map firstMap = (Map) convertList.get(0);

                    if (firstMap.get("data") instanceof List) {
                        List tempList = (List) firstMap.get("data");

                        // 첫 번째 경로 확인: ((List) convertList.get(0).get("data")).get(0)
                        if (tempList != null && !tempList.isEmpty()) {
                            if (tempList.get(0) instanceof List) {
                                dataList = (List) tempList.get(0);
                            }
                            // 두 번째 경로 확인: (List) ((Map) ((List)
                            // convertList.get(0).get("data")).get(0)).get("data")
                            else if (tempList.get(0) instanceof Map) {
                                Map nestedMap = (Map) tempList.get(0);
                                if (nestedMap.get("data") instanceof List) {
                                    dataList = (List) nestedMap.get("data");
                                } else {
                                    // 세번째까지 확인
                                    if (((Map) (nestedMap.get("data"))) != null
                                            && ((Map) (nestedMap.get("data"))).get("data") != null) {
                                        dataList = (List) ((Map) (nestedMap.get("data"))).get("data");
                                    } else {
                                        dataList = tempList;
                                    }
                                }
                            } else {
                                dataList = tempList;
                            }
                        }
                    }
                }

                if (isPipelineJson) {
                    dataList = SqlCommandUtils.makeFullJson(dataList);
                }

                SswResponseDataDTO resDto = new SswResponseDataDTO();
                resDto.setSqlId(dto.getSqlId());
                resDto.setData(dataList);
                resList.add(resDto);

            }
        } catch (Exception e) {
            return_msg = e.getMessage();
            log.error("error", e);
        }

        SswResponseDTO result = new SswResponseDTO();
        result.setRtnCode(return_cd);
        if (return_cd.equals(SswConstants.RESULT_CODE_SUCCESS)) {
            result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);

            // Keycloak 비밀번호 업데이트 로직 추가
            if (dtoList != null && !dtoList.isEmpty()) {
                Map<String, Object> params = dtoList.get(0).getParams().get(0); // 파라미터가 첫 번째 Map에 있다고 가정
                if (params != null
                        && "hrs_login_user_vrfc_chg_pswd".equals(params.get(SqlConstants.REDIS_SQL_KEY))) {
                    // Keycloak 업데이트에 필요한 파라미터 추출 (키 이름은 가정)
                    String userId = params.containsKey("user_id") ? String.valueOf(params.get("user_id")) : null;
                    String newPassword = params.containsKey("chg_pswd") ? (String) params.get("chg_pswd") : null;

                    if (userId != null && newPassword != null) {
                        try {
                            // KeycloakPasswordUpdateRequestDto 객체 생성 및 값 설정
                            KeycloakUpdatePasswordRequestDto requestDto = new KeycloakUpdatePasswordRequestDto();
                            requestDto.setUsername(userId); // DTO에 맞는 setter 사용 (메소드 이름은 가정)
                            requestDto.setNewPassword(newPassword); // DTO에 맞는 setter 사용 (메소드 이름은 가정)

                            // 서비스 호출
                            keycloakPasswordService.updatePassword(requestDto);
                            log.info("Keycloak 비밀번호 업데이트 성공: 사용자 번호 = {}, SQL Key = {}", userId,
                                    params.get(SqlConstants.REDIS_SQL_KEY));
                        } catch (Exception e) {
                            log.error("Keycloak 비밀번호 업데이트 실패: 사용자 번호 = {}", userId, e);
                            // Keycloak 업데이트 실패 시 RuntimeException을 발생시켜 트랜잭션 롤백 유도
                            throw new RuntimeException("Keycloak 비밀번호 업데이트 중 오류 발생: " + e.getMessage(), e);
                        }
                    } else {
                        log.warn("Keycloak 비밀번호 업데이트에 필요한 파라미터(user_no 또는 chg_pswd)가 부족합니다. Params: {}", params);
                        // 파라미터 부족 시 RuntimeException을 발생시켜 트랜잭션 롤백 유도
                        throw new RuntimeException("Keycloak 비밀번호 업데이트 파라미터 부족");
                    }
                }
            }

        } else {
            result.setRtnMsg(return_msg);
        }
        result.setResData(resList);

        return result;
    }

    /**
     * sql 호출 조회 (임시 급여용)
     */
    @Transactional
    public SswResponseDTO ssw00002(@RequestBody List<SswRequestSqlDTO> dtoList, boolean isPipelineJson)
            throws ParseException {

        List<SswResponseDataDTO> resList = new ArrayList<SswResponseDataDTO>();

        for (SswRequestSqlDTO dto : dtoList) {
            List<Map<String, Object>> list = sqlService.executeQuery_select_for_func(dto);

            // full json 형식으로 만듬
            // 공통일 시, 0번째에 data만 존재하고 해당 data가 실제 데이터임
            List<Map<String, Object>> convertList = list;
            if (convertList != null && convertList.size() > 0 && convertList.get(0).get("data") != null) {

                if (convertList.get(0).get("data") instanceof List) {
                    convertList = (List) convertList.get(0).get("data");
                } else if (convertList.get(0).get("data") instanceof Map) {
                    List<Map<String, Object>> convertList2 = new ArrayList<>();
                    convertList2.add((Map) convertList.get(0).get("data"));
                    convertList = convertList2;
                }
            }

            List<Map<String, Object>> finalResult = extractValuesAll(convertList);

            if (isPipelineJson) {
                convertList = SqlCommandUtils.makeFullJson((List) finalResult.get(0).get("data"));
            }

            SswResponseDataDTO resDto = new SswResponseDataDTO();
            resDto.setSqlId(dto.getSqlId());
            resDto.setData(convertList);
            resList.add(resDto);

        }

        SswResponseDTO result = new SswResponseDTO();
        result.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
        result.setResData(resList);

        return result;
    }

    @Transactional
    public SswResponseDTO ssw0005(@RequestBody List<SswRequestSqlDTO> dtoList, boolean isPipelineJson)
            throws ParseException {

        List<SswResponseDataDTO> resList = new ArrayList<SswResponseDataDTO>();

        // return cd 넣어줌
        String return_cd = "";
        String return_msg = "";
        try {
            for (SswRequestSqlDTO dto : dtoList) {
                List<Map<String, Object>> list = sqlService.executeQuery_select_for_func(dto);

                // full json 형식으로 만듬
                // 공통일 시, 0번째에 data만 존재하고 해당 data가 실제 데이터임
                List<Map<String, Object>> convertList = list;
                if (convertList != null && convertList.size() > 0 && convertList.get(0).get("data") != null) {

                    if (convertList.get(0).get("data") instanceof List) {
                        convertList = (List) convertList.get(0).get("data");
                    } else if (convertList.get(0).get("data") instanceof Map) {
                        List<Map<String, Object>> convertList2 = new ArrayList<>();
                        convertList2.add((Map) convertList.get(0).get("data"));
                        convertList = convertList2;
                    }
                    if (convertList.get(0).get("return_cd") != null) {
                        return_cd = String.valueOf(convertList.get(0).get("return_cd"));
                    }
                }

                // db함수 값이 없음
                if (SqlConstants.COMMON_SQL_NO_DATA_CODE.equals(convertList.get(0).get("return_cd"))) {
                    return_msg = String.valueOf(convertList.get(0).get("error_msg"));
                    return_cd = String.valueOf(convertList.get(0).get("return_cd"));

                    SswResponseDTO result = new SswResponseDTO();
                    result.setRtnCode(return_cd);
                    result.setRtnMsg(return_msg);
                    result.setResData(resList);

                    return result;
                }
                // db함수 오류 
                @SuppressWarnings("unchecked")
                Map<String,Object> sqlgenMap = (Map<String,Object>)((Map<String,Object>)((List<Map<String,Object>>)((Map<String,Object>)convertList.get(0)).get("data")).get(0)).get("saaswin_sqlgen_select");
                List<Map<String,Object>> jsonbList = (List<Map<String,Object>>)sqlgenMap.get("return_jsonb");
                Map<String,Object> row = jsonbList.get(0);
                            if (row.get("error_msg") != null) {
                                return_msg = String.valueOf(row.get("error_msg"));
                                if (row.get("return_cd") != null) {
                                    return_cd = String.valueOf(row.get("return_cd"));
                                }
                                SswResponseDTO result = new SswResponseDTO();
                                result.setRtnCode(return_cd);
                                result.setRtnMsg(return_msg);
                                result.setResData(resList);
                                return result;
                            }

                // return_cd 와 data를 각각 따로 - return_cd는 판단하여 RtnCode와 RtnMsg에 넣음
                // List dataList = (List) (((Map) ((Map) ((List) convertList.get(0).get("data")).get(0)).get("data")).get("return_jsonb"));
                List<Map<String,Object>> dataList = (List<Map<String,Object>>)sqlgenMap.get("return_jsonb");

                if (isPipelineJson) {
                    dataList = SqlCommandUtils.makeFullJson(dataList);
                }

                SswResponseDataDTO resDto = new SswResponseDataDTO();
                resDto.setSqlId(dto.getSqlId());
                resDto.setData(dataList);
                resList.add(resDto);

            }
        } catch (Exception e) {
            return_msg = e.getMessage();
            log.error("error", e);
        }

        SswResponseDTO result = new SswResponseDTO();
        result.setRtnCode(return_cd);
        if (return_cd.equals(SswConstants.RESULT_CODE_SUCCESS)) {
            result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
        } else {
            result.setRtnMsg(return_msg);
        }
        result.setResData(resList);

        return result;
    }

    @Transactional
    public SswResponseDTO ssw0006(@RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException {

        List<SswResponseDataDTO> resList = new ArrayList<SswResponseDataDTO>();

        // return cd 넣어줌
        String return_cd = "";
        String return_msg = "";
        try {
            for (SswRequestSqlDTO dto : dtoList) {
                List<Map<String, Object>> list = sqlService.executeQuery_select_for_func(dto);

                // full json 형식으로 만듬
                // 공통일 시, 0번째에 data만 존재하고 해당 data가 실제 데이터임
                List<Map<String, Object>> convertList = list;
                if (convertList != null && convertList.size() > 0 && convertList.get(0).get("data") != null) {

                    if (convertList.get(0).get("data") instanceof List) {
                        convertList = (List) convertList.get(0).get("data");
                    } else if (convertList.get(0).get("data") instanceof Map) {
                        List<Map<String, Object>> convertList2 = new ArrayList<>();
                        convertList2.add((Map) convertList.get(0).get("data"));
                        convertList = convertList2;
                    }
                    if (convertList.get(0).get("return_cd") != null) {
                        return_cd = String.valueOf(convertList.get(0).get("return_cd"));
                    }
                }

                // db함수에서 오류시
                List resultCud = ((List) ((Map) ((List) convertList.get(0).get("data")).get(0))
                        .get("saaswin_sqlgen_cud"));
                if (resultCud != null && resultCud.size() > 0 && ((Map) resultCud.get(0)).get("error_msg") != null) {
                    return_msg = String.valueOf(((Map) resultCud.get(0)).get("error_msg"));

                    SswResponseDTO result = new SswResponseDTO();
                    result.setRtnCode("");
                    result.setRtnMsg(return_msg);
                    result.setResData(resList);

                    return result;
                }

                // return_cd 와 data를 각각 따로 - return_cd는 판단하여 RtnCode와 RtnMsg에 넣음

                SswResponseDataDTO resDto = new SswResponseDataDTO();
                resDto.setSqlId(dto.getSqlId());
                // resDto.setData();
                resList.add(resDto);

            }
        } catch (Exception e) {
            return_msg = e.getMessage();
            log.error("error", e);
        }

        SswResponseDTO result = new SswResponseDTO();
        result.setRtnCode(return_cd);
        if (return_cd.equals(SswConstants.RESULT_CODE_SUCCESS)) {
            result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
        } else {
            result.setRtnMsg(return_msg);
        }
        result.setResData(resList);

        return result;
    }

    //////////////////////////////////////////////////////////////////////////////
    /// private 기능정의 //
    //////////////////////////////////////////////////////////////////////////////

    // 컬럼정보 조회
    private List<Map<String, Object>> getSswColumnsInfo(SswRequestObjectDTO dto) throws ParseException {

        SswRequestSqlDTO colDto = new SswRequestSqlDTO();
        colDto.setSqlId(SqlConstants.OBJECT_SEARCH_SQL_ID_01);
        List<Map<String, Object>> colParams = new ArrayList<Map<String, Object>>();
        Map<String, Object> colParam = new HashMap<String, Object>();
        colParam.put("scr_itg_no", dto.getScr_itg_no());
        colParam.put("scr_type_cd", dto.getScr_type_cd());
        colParams.add(colParam);
        colDto.setParams(colParams);
        List<Map<String, Object>> colList = sqlService.executeQuery_select(colDto);

        return colList;
    }

    // 화면정보 조회
    private List<Map<String, Object>> getSswObjectInfo(SswRequestObjectDTO dto) throws ParseException {

        SswRequestSqlDTO objDto = new SswRequestSqlDTO();
        objDto.setSqlId(SqlConstants.OBJECT_SEARCH_SQL_ID_02);
        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();

        Map<String, Object> objParam = new HashMap<String, Object>();
        objParam = SswUtils.convertDTOToMap(dto);
        objParams.add(objParam);
        objDto.setParams(objParams);
        List<Map<String, Object>> objList = sqlService.executeQuery_select(objDto);

        return objList;
    }

    // 화면정보 조회
    private List<Map<String, Object>> getSswObjectInfo_for_func(SswRequestObjectDTO dto) throws ParseException {

        SswRequestSqlDTO objDto = new SswRequestSqlDTO();
        objDto.setSqlId(SqlConstants.REDIS_SQL_SCR_01);

        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();

        Map<String, Object> objParam = new HashMap<String, Object>();
        objParam = SswUtils.convertDTOToMap(dto);
        objParam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_SCR_KEY_01);
        objParams.add(objParam);
        objDto.setParams(objParams);
        List<Map<String, Object>> objList = sqlService.executeQuery_select_for_func(objDto);

        List<Map<String, Object>> returnObjList = ((List) ((Map) ((List) ((Map) objList.get(0).get("data")).get("data"))
                .get(0)).get("data"));

        // checkReturnCd(return_cd);

        return returnObjList;
    }

    // 하위 화면정보 조회
    private List<Map<String, Object>> getSswDetailObjectInfo(Map<String, Object> dto) throws ParseException {

        SswRequestSqlDTO objDto = new SswRequestSqlDTO();
        if (dto.get("type").equals("G")) { // 하단그리드인 경우
            objDto.setSqlId(SqlConstants.OBJECT_SEARCH_SQL_ID_03);
        } else if (dto.get("type").equals("T")) { // 하단테이블인 경우
            objDto.setSqlId(SqlConstants.OBJECT_SEARCH_SQL_ID_66);
        }

        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();
        objParams.add(dto);
        objDto.setParams(objParams);

        List<Map<String, Object>> objList = sqlService.executeQuery_select(objDto);

        return objList;
    }

    // 하위 화면정보 조회
    private List<Map<String, Object>> getSswDetailObjectInfo_for_func(Map<String, Object> dto) throws ParseException {

        SswRequestSqlDTO objDto = new SswRequestSqlDTO();
        objDto.setSqlId(SqlConstants.REDIS_SQL_SCR_01);

        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();

        Map<String, Object> objParam = new HashMap<String, Object>();
        objParam = SswUtils.convertDTOToMap(dto);
        if (dto.get("type").equals("G")) { // 하단그리드인 경우
            objParam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_SCR_KEY_02);
        } else if (dto.get("type").equals("T")) { // 하단테이블인 경우
            objParam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_SCR_KEY_03);
        }

        objParams.add(objParam);
        objDto.setParams(objParams);
        List<Map<String, Object>> objList = sqlService.executeQuery_select_for_func(objDto);

        List<Map<String, Object>> returnObjList = ((List) ((Map) objList.get(0).get("data")).get("data"));

        return returnObjList;
    }

    // 권한별 화면번호 조회
    private List<Map<String, Object>> getSswItgNoInfo(SswRequestObjectDTO dto) throws ParseException {

        SswRequestSqlDTO objDto = new SswRequestSqlDTO();
        objDto.setSqlId(SqlConstants.OBJECT_SEARCH_SQL_ID_04);
        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();
        Map<String, Object> objParam = new HashMap<String, Object>();
        objParam.put("user_no", dto.getUser_no());
        objParam.put("menu_no", dto.getMenu_no());
        objParams.add(objParam);
        objDto.setParams(objParams);
        List<Map<String, Object>> objList = sqlService.executeQuery_select(objDto);

        return objList;
    }

    // 탭 정보 조회
    private List<Map<String, Object>> getSswTabObjectInfo(Map<String, Object> dto) throws ParseException {

        // getSswObjectInfo 혹은 2번SQL을 계속 돌려서 tab화면 전부 json형태로 만들기
        SswRequestSqlDTO objDto = new SswRequestSqlDTO();
        objDto.setSqlId(SqlConstants.OBJECT_SEARCH_SQL_ID_03);
        List<Map<String, Object>> objParams = new ArrayList<Map<String, Object>>();
        objParams.add(dto);
        objDto.setParams(objParams);
        List<Map<String, Object>> objList = sqlService.executeQuery_select(objDto);

        return objList;
    }

    // return_cd 체크
    private String checkReturnCd(List<Map<String, Object>> returnObjList) throws ParseException {
        String return_cd = (String) ((Map) returnObjList.get(0).get("data")).get("return_cd");
        if (return_cd != "40002") {
            return "";
        }

        return "";
    }

    /**
     * 응답에서 특정 키 목록의 값을 추출하는 메서드 (전체)
     * 
     * @param response List<Map<String, Object>> 객체
     * @return 추출된 값 (List<Map> 형태)
     */
    public List<Map<String, Object>> extractValuesAll(List<Map<String, Object>> response) {
        // SswResponseDataDTO finalResult = new SswResponseDataDTO();

        List<Map<String, Object>> resultList = new ArrayList<>();
        Map<String, Object> result = new HashMap<>();

        if (response == null) {
            return resultList;
        }

        for (Map<String, Object> dataEntry : response) {
            if (!dataEntry.containsKey("data"))
                continue;

            Object dataObject = dataEntry.get("data");

            if (dataObject instanceof List<?>) {
                List<?> dataList = (List<?>) dataObject;

                // 리스트 크기가 2 이상인지 확인
                if (dataList.size() >= 2) {
                    result.put("data", dataObject);
                    break;
                }

                for (Object innerData : dataList) {
                    if (!(innerData instanceof Map<?, ?>))
                        continue;
                    Map<?, ?> innerMap = (Map<?, ?>) innerData;

                    Object innerDataObject = null;

                    if (innerMap.get("data") == null) {
                        innerDataObject = innerMap.get("jsonb_agg");
                    } else {
                        innerDataObject = innerMap.get("data");
                    }

                    while (innerDataObject instanceof Map<?, ?> &&
                            (((Map<?, ?>) innerDataObject).containsKey("data") ||
                                    ((Map<?, ?>) innerDataObject).containsKey("jsonb_agg"))) {
                        Map<?, ?> innerDataMap = (Map<?, ?>) innerDataObject;

                        if (innerDataMap.get("data") == null) {
                            innerDataObject = innerDataMap.get("jsonb_agg");
                        } else {
                            innerDataObject = innerDataMap.get("data");
                        }
                    }

                    if (innerDataObject instanceof Map<?, ?>) {
                        result.put("data", innerDataObject);
                    } else if (innerDataObject instanceof List<?>) {
                        result.put("data", innerDataObject);
                    }
                }
            }
        }

        result.put("return_cd", response.get(0).get("return_cd"));
        log.debug("result {}", result);
        resultList.add(result);
        log.debug("resultList {}", resultList);

        return resultList;
    }

}
