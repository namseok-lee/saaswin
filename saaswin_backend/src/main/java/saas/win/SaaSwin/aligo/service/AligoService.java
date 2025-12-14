package saas.win.SaaSwin.aligo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.*;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.Constants.AligoConstants;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.aligo.dto.AligoResponseDTO;
import saas.win.SaaSwin.aligo.dto.AligoRequestDTO;
import saas.win.SaaSwin.aligo.dto.AligoRequestObjectDTO;
import saas.win.SaaSwin.sql.command.dto.SqlDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.util.SswUtils;

import javax.sql.DataSource;
import java.io.*;
import java.net.*;
import java.sql.*;
import java.text.ParseException;
import java.util.*;
import java.util.function.Function;

@RequiredArgsConstructor
@Service
@Slf4j
public class AligoService {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate; // datasource말고 이거쓰면 좀더 간편
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Autowired
    private SqlService sqlService;

    // 알리고 톡 전송 후 저장
    public SswResponseDTO sendAligoTalk(@RequestBody List<AligoRequestDTO> reqDataList) {

        SswResponseDTO res = new SswResponseDTO();
        res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);

        int totalParamsSize = reqDataList.get(0).getParams().size();

        int batchSize = 500; // 각 묶음의 크기를 500개로 설정
        int batchCount = (int) Math.ceil((double) totalParamsSize / batchSize);

        for (int batchIndex = 0; batchIndex < batchCount; batchIndex++) {
            StringBuilder postData = new StringBuilder();
            try {
                postData.append("apikey=").append(URLEncoder.encode(AligoConstants.SNDR_API, "UTF-8")); // 알리고 API 키 추가
                postData.append("&userid=").append(URLEncoder.encode(AligoConstants.SNDR_ID, "UTF-8")); // 사용자 ID 추가
                postData.append("&senderkey=").append(URLEncoder.encode(AligoConstants.SNDR_PROFILE, "UTF-8")); // 발신자 키 추가
                postData.append("&sender=").append(URLEncoder.encode(AligoConstants.SNDR_TELNO, "UTF-8")); // 발신자 전화번호 추가
                postData.append("&failover=").append(URLEncoder.encode("Y", "UTF-8")); // 전송 실패 시 대체 발송 여부 설정
                postData.append("&tpl_code=").append(URLEncoder.encode(reqDataList.get(0).getNt_tmplt(), "UTF-8"));
                int startIndex = batchIndex * batchSize; // 현재 묶음의 시작 인덱스
                int endIndex = Math.min(startIndex + batchSize, totalParamsSize); // 현재 묶음의 종료 인덱스

                log.info("Processing batch {}: start index = {}, end index = {}", batchIndex + 1, startIndex, endIndex);

                int index = 1;
                AligoRequestDTO reqData = reqDataList.get(0); // 현재 처리 중인 데이터 가져오기
                // DB select
                // user_no으로 회원 정보 검색
                List<AligoRequestObjectDTO> userinfo = findUser(reqDataList.get(0).getParams());
                // 템플릿 번호로 탬플릿 정보 검색 후 회원마다 텍스트 변환해 넣어줌
                List<AligoRequestObjectDTO> userList = findTemplate(reqData, userinfo);

                // 알리고 API 요청에 필요한 데이터 추가
                for (AligoRequestObjectDTO param : userList) {
                    postData.append("&receiver_").append(index).append("=").append(URLEncoder.encode(param.getRcvr_telno(), "UTF-8"));
                    // 톡과 SMS는 동일한 내용이 들어감
                    postData.append("&subject_").append(index).append("=").append(URLEncoder.encode(param.getNt_tit(), "UTF-8"));
                    postData.append("&message_").append(index).append("=").append(URLEncoder.encode(param.getNt_cn(), "UTF-8"));
                    postData.append("&fsubject_").append(index).append("=").append(URLEncoder.encode(param.getNt_tit(), "UTF-8"));
                    postData.append("&fmessage_").append(index).append("=").append(URLEncoder.encode(param.getNt_cn(), "UTF-8"));

                    // 강조타이틀 존재한다면 넣음
                    if (!StringUtils.isBlank(param.getEmpas_tit())) {
                        postData.append("&emtitle_").append(index).append("=").append(URLEncoder.encode(param.getEmpas_tit(), "UTF-8"));
                    }
                    // 버튼정보 존재한다면 넣음
                    if (!StringUtils.isBlank(param.getBtn_info())) {
                        postData.append("&button_").append(index).append("=").append(URLEncoder.encode(param.getBtn_info(), "UTF-8"));
                    }

                    index++;
                }
                try {
                    // 알리고 알림톡 전송 API 호출
                    String url = AligoConstants.SNDR_SEND_URL;
                    URL obj = new URL(url);
                    HttpURLConnection connection = (HttpURLConnection) obj.openConnection();
                    connection.setRequestMethod("POST");
                    connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
                    connection.setDoOutput(true);

                    try (OutputStream os = connection.getOutputStream()) {
                        os.write(postData.toString().getBytes("UTF-8"));
                    }

                    int responseCode = connection.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        log.info("알리고 API 서비스단 카카오톡 보내기 성공");
                        try (BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                            String inputLine;
                            StringBuilder response = new StringBuilder();
                            while ((inputLine = in.readLine()) != null) {
                                response.append(inputLine);
                            }
                            JsonObject jsonResponse = JsonParser.parseString(response.toString()).getAsJsonObject();
                            log.debug(jsonResponse.toString());

                            // json타입 response에서 저장될 값 추출
                            String code = jsonResponse.get("code").getAsString();
                            String message = jsonResponse.get("message").getAsString();
                            JsonObject info = jsonResponse.getAsJsonObject("info");
                            String infoString = new Gson().toJson(info);
                            String mid = info.has("mid") ? info.get("mid").getAsString() : null;

                            // 알림톡 전송 DB insert
                            insertAligoTalk(reqDataList, userList, code, message, infoString, mid);
                            log.info("API 응답 코드: {}, 응답 메시지: {}", code, message);
                        } catch (Exception e) {
                            log.error("error", e);
                        }
                    } else {
                        log.error("알리고 API 서비스단 카카오톡 보내기 실패, 응답 코드: {}", responseCode); // 실패 시 응답 코드 로그 출력
                    }

                } catch (IOException e) {
                    log.error("알리고 API 호출 오류: {}", e.getMessage(), e); // API 호출 중 발생한 오류 로그 출력
                }
            } catch (UnsupportedEncodingException e) {
                log.error("postData 인코딩 오류: {}", e.getMessage(), e); // postData 인코딩 오류 로그 출력
            } catch (ParseException e) {
                throw new RuntimeException(e);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
        return res;
    }

    // template 검색 메소드
    public List<AligoRequestObjectDTO> findTemplate(AligoRequestDTO reqData, List<AligoRequestObjectDTO> userList) throws ParseException, JsonProcessingException {

        // template 가져오기
        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(SqlConstants.REDIS_SQL_ALG_01);
        sqlDto.setSql_key(SqlConstants.REDIS_SQL_ALG_KEY_02);
        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("nt_tmplt_no", reqData.getNt_tmplt());
        //ssparam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_ALG_KEY_02);
        params.add(param);
        sqlDto.setParams(params);
        List<Map<String, Object>> template = sqlService.executeQuery_select_for_func(sqlDto);
        template = (List) ((Map)template.get(0).get("data")).get("data");
        //        List<Map<String, Object>> template = sqlService.executeQuery_select(sqlDto);
        // tim_nt_tmplt 테이블에서 가져오는 기본 틀
        String basic_nt_tit = "";
        String basic_nt_cn = "";
        String basic_nt_vrbl = "";
        String basic_empas_tit = ""; // 강조표시타이틀
        String basic_empas_tit_vrbl = ""; // 강조표시타이틀 파라미터 jsonb
        String basic_btn_info = ""; // 버튼정보 jsonb
        for (Map<String, Object> tem : template) {
            basic_nt_tit = String.valueOf(tem.get("nt_tit"));
            basic_nt_cn = String.valueOf(tem.get("nt_cn"));
            basic_nt_vrbl = String.valueOf(tem.get("nt_vrbl"))
                    .replace("=", ":") // '='를 ':'로 변환
                    .replaceAll("([{,]\\s*)([a-zA-Z0-9_]+)(:\\s*)", "$1\"$2\"$3") // 필드 이름에 쿼트 추가
                    .replaceAll("(:\\s*)([a-zA-Z가-힣0-9_]+)([}\\],])", "$1\"$2\"$3"); // 값에 쿼트 추가

            if(tem.get("empas_tit") != null) {
                basic_empas_tit = String.valueOf(tem.get("empas_tit"));
            }
            if(tem.get("empas_tit_vrbl") != null) {
                basic_empas_tit_vrbl = String.valueOf(tem.get("empas_tit_vrbl"))
                    .replace("=", ":") // '='를 ':'로 변환
                    .replaceAll("([{,]\\s*)([a-zA-Z0-9_]+)(:\\s*)", "$1\"$2\"$3") // 필드 이름에 쿼트 추가
                    .replaceAll("(:\\s*)([a-zA-Z가-힣0-9_]+)([}\\],])", "$1\"$2\"$3"); // 값에 쿼트 추가
            }
            if(tem.get("btn_info") != null) {
                basic_btn_info = String.valueOf(tem.get("btn_info"))
                    .replace("=", ":") // '='를 ':'로 변환
                    .replaceAll("([{,]\\s*)([a-zA-Z0-9_]+)(:\\s*)", "$1\"$2\"$3") // 필드 이름에 쿼트 추가
                    .replaceAll("(:\\s*)([a-zA-Z가-힣0-9_]+)([}\\],])", "$1\"$2\"$3"); // 값에 쿼트 추가
            }
        }

        for (AligoRequestObjectDTO user : userList) {
            // reqData의 params의 List에서 user_no이 동일한 param 객체만 넘긴다.
            Map<String, String> matchingParam = null;
            for (Map<String, String> param1 : reqData.getParams()) {
                if (param1.get("user_no").equals(user.getUser_no())) {
                    matchingParam = param1;
                    break;
                }
            }
            user.setNt_tit(basic_nt_tit);
            // 템플릿 내용 params로 변환하는 메소드
            user.setNt_cn(changeNtCn(basic_nt_vrbl, basic_nt_cn, user, matchingParam));
            // 강조표시제목을 params로 변환하는 메소드
            user.setEmpas_tit(changeNtCn(basic_empas_tit_vrbl, basic_empas_tit, user, matchingParam));
            // 버튼의 내용을 넣어줌
            user.setBtn_info(null);
        }

        return userList;
    }

    // 템플릿 텍스트 전환 함수
    public String changeNtCn(String ntVrblJson, String basic_nt_cn, AligoRequestObjectDTO req, Map<String, String> matchingParam) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        log.info(ntVrblJson);

        List<Map<String, String>> ntVrbl = objectMapper.readValue(ntVrblJson, new TypeReference<List<Map<String, String>>>() {
        });

        StringBuilder updatedNtCnBuilder = new StringBuilder(basic_nt_cn);

        // 리스트의 각 변수를 순회하며 실제 값으로 플레이스홀더를 대체
        for (Map<String, String> variable : ntVrbl) {
            String name = variable.get("name");
            String id = variable.get("id");
            String type = variable.get("type");
            // 변환될 nt_cn값 초기화
            String replacementValue = "";

            // type에 따라 다른 로직 처리
            switch (type) {
                case AligoConstants.SNDR_TYPE_CLIENT:
                    if (matchingParam.containsKey(id)) {
                        replacementValue = matchingParam.get(id);
                    }
                    break;
                case AligoConstants.SNDR_TYPE_USER_NAME:
                    // 유저 테이블에서 받아오는 경우 수신자의 이름 가져옴
                    if ("user_no".equals(id)) {
                        replacementValue = req.getRcvr_flnm();
                    }
                    break;
                case AligoConstants.SNDR_TYPE_JOBS_NAME:
                    // 유저 테이블에서 받아오는 경우 수신자의 이름 가져옴
                    if (matchingParam.containsKey(id)) {
                        replacementValue = req.getJbps_nm();
                    }
                    break;
                default:
                    // 기타는 빈 문자열
                    break;
            }

            // 알림 내용에서 플레이스홀더를 실제 값으로 대체
            String placeholder = "#{" + name + "}";
            int index;
            while ((index = updatedNtCnBuilder.indexOf(placeholder)) != -1) {
                updatedNtCnBuilder.replace(index, index + placeholder.length(), replacementValue);
            }
        }
        return updatedNtCnBuilder.toString();
    }

    // user_no로 회원 검색 메소드
    public List<AligoRequestObjectDTO> findUser(List<Map<String, String>> params) throws ParseException {
        // 유저 검색하기
        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(SqlConstants.REDIS_SQL_ALG_01);
        sqlDto.setSql_key(SqlConstants.REDIS_SQL_ALG_KEY_05);

        List<Map<String, Object>> convertedParams = new ArrayList<>();

        for (Map<String, String> inputParam : params) {
            Map<String, Object> convertedParam = new HashMap<>(inputParam); // String 값이 Object로 변환
            convertedParams.add(convertedParam);
        }

        List<Map<String, Object>> userList = new ArrayList<>();
        // sql문에서 반환되는 List 저장
        for (Map<String, Object> param : convertedParams) {
            sqlDto.setParams(Collections.singletonList(param)); // 개별 매개변수 설정
//            List<Map<String, Object>> result = sqlService.executeQuery_select(sqlDto);
            List<Map<String, Object>> result = sqlService.executeQuery_select_for_func(sqlDto);
            Map<String, Object> resMap = (Map)result.get(0).get("data");
            if(resMap == null) continue;
            resMap = (Map)((Map)((List)resMap.get("data")).get(0)).get("data");
            resMap.put("user_no", param.get("user_no"));
            userList.add(resMap);
        }
        // list를 반환DTO로 매핑
        List<AligoRequestObjectDTO> resultList = new ArrayList<>();
        for (Map<String, Object> result : userList) {
            AligoRequestObjectDTO dto = new AligoRequestObjectDTO();
            dto.setUser_no(String.valueOf( result.get("user_no") ));
            dto.setRcvr_flnm(String.valueOf( ((Map)(((List)(result.get("bsc_info"))).get(0))).get("korn_flnm")));

            // 전화번호 설정 - hrs_group00770_cm0001 조건으로 필터링
            try {
                Object telnoInfoObj = result.get("telno_info");
                String selectedTelno = null;

                if (telnoInfoObj instanceof List) {
                    List<?> telnoInfoList = (List<?>) telnoInfoObj;

                    for (Object item : telnoInfoList) {
                        if (item instanceof Map) {
                            Map<String, Object> telnoInfo = (Map<String, Object>) item;

                            String telnoKndCd = Optional.ofNullable(telnoInfo.get("telno_knd_cd"))
                                                    .map(String::valueOf)
                                                    .orElse("");

                            if (SqlConstants.COMMON_CODE_TELNO.equals(telnoKndCd)) {
                                selectedTelno = Optional.ofNullable(telnoInfo.get("telno"))
                                                    .map(String::valueOf)
                                                    .orElse("");
                                break; // 찾았으면 루프 종료
                            }
                        }
                    }
                }

                if (selectedTelno != null && !selectedTelno.isEmpty()) {
                    dto.setRcvr_telno(SswUtils.removeHyphens(selectedTelno));
                } else {
                    // hrs_group00770_cm0001이 없으면 첫 번째 전화번호 사용 (기존 로직 유지)
                    dto.setRcvr_telno(SswUtils.removeHyphens(String.valueOf(((Map)(((List)(result.get("telno_info"))).get(0))).get("telno"))));
                }
            } catch (Exception e) {
                log.warn("전화번호 설정 중 오류 발생: {}", e.getMessage());
                // 오류 시 기존 로직 사용
                try {
                    dto.setRcvr_telno(SswUtils.removeHyphens(String.valueOf(((Map)(((List)(result.get("telno_info"))).get(0))).get("telno"))));
                } catch (Exception ex) {
                    log.error("기본 전화번호 설정도 실패: {}", ex.getMessage());
                }
            }

            //hpo_group00286_cm0019
//            Map<String, Object> cmcd = sqlService.getCmcd(String.valueOf( ((Map) result.get("apnt_info")).get("apnt_jbps_cd") ));
//            dto.setJbps_nm(String.valueOf( cmcd.get("com_cd_nm") ));
            resultList.add(dto);
        }
        return resultList;
    }

    // 보낸 알림톡 DB저장
    public void insertAligoTalk(List<AligoRequestDTO> req, List<AligoRequestObjectDTO> userList, String code, String message, String infoString, String mid) throws ParseException, SQLException {

        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(SqlConstants.REDIS_SQL_ALG_01);
        sqlDto.setSql_key(SqlConstants.REDIS_SQL_ALG_KEY_04);
//        sqlDto.setSqlId(SqlConstants.ALG_SQL_ID_04);
        int index = 1;
        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();

        for (AligoRequestObjectDTO user : userList) {
            Map<String, Object> param = SswUtils.convertDTOToMap(user);
            param.put("sndr_api", AligoConstants.SNDR_API);
            param.put("sndr_id", AligoConstants.SNDR_ID);
            param.put("sndr_profile", AligoConstants.SNDR_PROFILE);
            param.put("sndr_telno", AligoConstants.SNDR_TELNO);
            param.put("nt_tmplt_no", req.get(0).getNt_tmplt());
            param.put("rsvt_dt", null);
            param.put("empas_tit", null);
            param.put("btn_info", null);
            param.put("fail_sndr_yn", "Y");
            param.put("fail_sndr_tit", user.getNt_tit());
            param.put("fail_sndr_cn", user.getNt_cn());
            param.put("test_yn", "Y");
            param.put("rslt_cd", code);
            param.put("rslt_msg", message);
            param.put("rslt_info", infoString);
            param.put("nt_mid", mid);
            param.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_ALG_KEY_04);
            params.add(param);
            index++;
        }
        sqlDto.setParams(params);
        List<Map<String, Object>> result = sqlService.executeQuery_select_for_func(sqlDto);
        try {
            if(!SqlConstants.COMMON_SQL_SUCCESS_CODE.equals(String.valueOf( ((Map)result.get(0).get("data")).get("return_cd") ) ) ) {
                log.error("aligo 발송이력 table insert error {}", sqlDto.getParams());
            }
        }
        catch (Exception e) {
            log.error("aligo 발송이력 table insert error {} " + e.getMessage(), sqlDto.getParams());
        }
    }

    // 톡 전송 결과 유무 확인
    public void checkSendKakaotalk() throws IOException, ParseException {
        List<String> ntMidList = findMid();
        // 새로 저장되어야 할 ntMidList의 List가 있는 경우만 실행
        if (ntMidList.size() > 0) {
            // 톡 전송 결과 상세 api 연결
            sendAligoTalkDetail(ntMidList);
        }
    }

    // 톡 전송 시도한 DB select문
    public List<String> findMid() throws ParseException {

        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(SqlConstants.REDIS_SQL_ALG_01);
        sqlDto.setSql_key(SqlConstants.REDIS_SQL_ALG_KEY_03);

        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
        Map<String, Object> param = new HashMap<String, Object>();
        params.add(param);
        sqlDto.setParams(params);

        List<Map<String, Object>> findMidList = sqlService.executeQuery_select_for_func(sqlDto);

        findMidList = (List) ((Map)findMidList.get(0).get("data")).get("data");

        List<String> ntMidList = new ArrayList<>();
        for (Map<String, Object> result : findMidList) {
            ntMidList.add(String.valueOf(result.get("nt_mid")));
        }
        return ntMidList;
    }

    // 알리고 전송 상세내역 API - 톡 전송 실패한 List를 받아서 List를 순회하며 메소드 실행
    public void sendAligoTalkDetail(List<String> midList) throws IOException {
        // midList 순회
        for (String mid : midList) {
            StringBuilder historyPostData = new StringBuilder();
            historyPostData.append("userid=").append(URLEncoder.encode(AligoConstants.SNDR_ID, "UTF-8"));
            historyPostData.append("&apikey=").append(URLEncoder.encode(AligoConstants.SNDR_API, "UTF-8"));
            if (mid != null) {
                historyPostData.append("&mid=").append(URLEncoder.encode(mid, "UTF-8"));
            }
            historyPostData.append("&page=").append(URLEncoder.encode("1", "UTF-8")); // 1발송당 500개씩 가능 따라서 500개가 1페이지에 나올 수 있음
            historyPostData.append("&limit=").append(URLEncoder.encode("500", "UTF-8"));

            String historyUrl = AligoConstants.SNDR_DETAIL_URL;
            URL historyObj = new URL(historyUrl);
            HttpURLConnection historyConnection = (HttpURLConnection) historyObj.openConnection();
            historyConnection.setRequestMethod("POST");
            historyConnection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            historyConnection.setDoOutput(true);

            try (OutputStream historyOs = historyConnection.getOutputStream()) {
                historyOs.write(historyPostData.toString().getBytes("UTF-8"));
            }

            int historyResponseCode = historyConnection.getResponseCode();
            if (historyResponseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader historyIn = new BufferedReader(new InputStreamReader(historyConnection.getInputStream()))) {
                    String historyInputLine;
                    StringBuilder historyResponse = new StringBuilder();
                    while ((historyInputLine = historyIn.readLine()) != null) {
                        historyResponse.append(historyInputLine);
                    }
                    JsonObject jsonHistoryResponse = JsonParser.parseString(historyResponse.toString()).getAsJsonObject();
                    log.debug(jsonHistoryResponse.toString());

                    String historyCode = jsonHistoryResponse.get("code").getAsString();
                    String historyMessage = jsonHistoryResponse.get("message").getAsString();
                    JsonArray list = jsonHistoryResponse.getAsJsonArray("list");

                    boolean checkSmsInsert = false;
                    for (int i = 0; i < list.size(); i++) {
                        JsonObject listObject = list.get(i).getAsJsonObject();
                        String rslt_info = new Gson().toJson(listObject);
                        String smid = listObject.has("smid") ? listObject.get("smid").getAsString() : "No smid";
                        log.info(smid);
                        String phone = listObject.get("phone").getAsString();
                        String status = listObject.has("status") ? listObject.get("status").getAsString() : "";
                        String rslt = listObject.has("rslt") ? listObject.get("rslt").getAsString() : "";

                        boolean checkSmid = midSending(smid);
                        log.info(String.valueOf(checkSmid));
                        AligoResponseDTO aligoResponseDTO = new AligoResponseDTO();
                        aligoResponseDTO.setNt_mid(mid);
                        aligoResponseDTO.setRcvr_telno(phone);
                        aligoResponseDTO.setSms_mid(smid);
                        aligoResponseDTO.setNt_rslt_info(rslt_info);

                        // 성공한 알림톡도 tim_nt_rslt 테이블에 저장
                        if (checkSmid) {
                            // 성공한 케이스 처리 (status가 성공 상태이거나 rslt가 성공 코드인 경우)
                            if (status.equals("3") || rslt.equals("S")) {
                                // 성공 케이스도 저장
                                insertAligoTalkDetail(aligoResponseDTO);
                                log.info("성공한 알림톡 정보 저장: mid={}, phone={}", mid, phone);
                            } else if (!smid.equals("0")) {
                                // 실패한 경우 SMS로 발송했는지 SMS발송 조회
                                checkSmsInsert = sendAligoTalkSMS(aligoResponseDTO);
                                // SMS 발송 결과와 관계없이 원본 알림톡 결과 저장
                                insertAligoTalkDetail(aligoResponseDTO);
                            } else {
                                // 그 외 모든 케이스도 저장
                                insertAligoTalkDetail(aligoResponseDTO);
                            }
                        }
                    }
                    log.info("API 응답 코드: {}, 응답 메시지: {}, 결과: {}", historyCode, historyMessage); // 응답 정보 로그 출력
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                } catch (ParseException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }

    // 알리고 전송 상세내역 전송완료 확인
    public boolean midSending(String reqMid) {
        if (reqMid.equals("No smid")) {
            return false;
        }
        return true;
    }

    // 알리고 전송 상세내역 DB isert
    public void insertAligoTalkDetail(AligoResponseDTO aligoResponseDTO) throws SQLException, ParseException {
        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
        sqlDto.setSqlId(SqlConstants.REDIS_SQL_ALG_01);
        sqlDto.setSql_key(SqlConstants.REDIS_SQL_ALG_KEY_01);

        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();

        Map<String, Object> param = SswUtils.convertDTOToMap(aligoResponseDTO);
        param.put("eml_sndr_yn", null);
        param.put("md_mid", param.get("md_mid") == null ? null : param.get("md_mid"));
        param.put("sms_cn", param.get("sms_cn") == null ? null : param.get("sms_cn"));
        param.put("sms_rslt_info", param.get("sms_rslt_info") == null ? null : param.get("sms_rslt_info"));
        //param.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_ALG_KEY_01);

        params.add(param);
        sqlDto.setParams(params);
        List<Map<String, Object>> list = sqlService.executeQuery_select_for_func(sqlDto);
        //log.info(String.valueOf(cnt));
    }

    // 알리고 전송SMS API, 카톡 전송이 실패된 smid를 받는다.
    public boolean sendAligoTalkSMS(AligoResponseDTO aligoResponseDTO) throws IOException {
        // 받아온 smid 확인
        StringBuilder smsPostData = new StringBuilder();
        smsPostData.append("key=").append(URLEncoder.encode(AligoConstants.SNDR_API, "UTF-8"));
        smsPostData.append("&userid=").append(URLEncoder.encode(AligoConstants.SNDR_ID, "UTF-8"));
        smsPostData.append("&mid=").append(URLEncoder.encode(aligoResponseDTO.getSms_mid(), "UTF-8"));
        smsPostData.append("&page=").append(URLEncoder.encode("1", "UTF-8")); // 1발송당 500개씩 가능 따라서 500개가 1페이지에 나올 수 있음
        smsPostData.append("&limit=").append(URLEncoder.encode("500", "UTF-8"));

        String smsUrl = AligoConstants.SNDR_SMS_SEND_URL;
        URL smsObj = new URL(smsUrl);
        HttpURLConnection smsConnection = (HttpURLConnection) smsObj.openConnection();
        smsConnection.setRequestMethod("POST");
        smsConnection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        smsConnection.setDoOutput(true);

        try (OutputStream smsOs = smsConnection.getOutputStream()) {
            smsOs.write(smsPostData.toString().getBytes("UTF-8"));
        }

        int smsResponseCode = smsConnection.getResponseCode();
        if (smsResponseCode == HttpURLConnection.HTTP_OK) {
            try (BufferedReader smsIn = new BufferedReader(new InputStreamReader(smsConnection.getInputStream()))) {
                String smsInputLine;
                StringBuilder smsResponse = new StringBuilder();
                while ((smsInputLine = smsIn.readLine()) != null) {
                    smsResponse.append(smsInputLine);
                }
                JsonObject jsonSmsResponse = JsonParser.parseString(smsResponse.toString()).getAsJsonObject(); // JSON 파싱
                log.debug(jsonSmsResponse.toString());
                JsonArray list = jsonSmsResponse.getAsJsonArray("list");
                String infoString = new Gson().toJson(list);
                log.info(infoString);
                // sms_id가 sending 중인지 확인 list의 사이즈가 0이상인경우 true 반환
                // list를 순회하면서 SMS 전송결과여부 추출
                boolean checkMdid = smidSending(list);
                log.info(String.valueOf(list.size()));
                if (checkMdid) {
                    for (int i = 0; i < list.size(); i++) {
                        JsonObject item = list.get(i).getAsJsonObject();
                        aligoResponseDTO.setMd_mid(item.get("mdid").getAsString());
                        aligoResponseDTO.setSms_cn(item.get("sms_state").getAsString());
                        aligoResponseDTO.setSms_rslt_info(String.valueOf(item));
                        aligoResponseDTO.setEmail_send_yn(null);
                        insertAligoTalkDetail(aligoResponseDTO);
                    }
                    return true;
                } else {
                    return false;
                }

            } catch (SQLException e) {
                throw new RuntimeException(e);
            } catch (ParseException e) {
                throw new RuntimeException(e);
            }
        }
        return false;
    }

    // sms전송 완료 확인
    public boolean smidSending(JsonArray list) {
        if (list.size() > 0) {
            for (int i = 0; i < list.size(); i++) {
                JsonObject item = list.get(i).getAsJsonObject();
                if (!"전송중".equals(item.get("sms_state").getAsString())) {
                    return true;
                }
            }
        }
        return false;
    }
}
