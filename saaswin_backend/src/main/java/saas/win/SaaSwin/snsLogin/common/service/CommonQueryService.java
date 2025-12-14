package saas.win.SaaSwin.snsLogin.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;
import saas.win.SaaSwin.ssw.service.SswService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.text.ParseException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommonQueryService {

    private final SswService sswService;

    /**
     * 공통적으로 SQL 실행 후 특정 키 값 추출하는 메서드
     * 
     * @param sqlId         실행할 SQL ID
     * @param params        SQL에 전달할 파라미터
     * @param keysToExtract 추출할 키 목록
     * @return 추출된 값 (Map 형태)
     */
    public Map<String, Object> executeQuery(String sqlId, Map<String, Object> params, List<String> keysToExtract) {
        // ✅ SQL 실행 요청 DTO 생성
        SswRequestSqlDTO sswRequestSqlDTO = new SswRequestSqlDTO();
        sswRequestSqlDTO.setSqlId(sqlId);
        sswRequestSqlDTO.setParams(Collections.singletonList(params));

        // ✅ SQL 요청 리스트 생성
        List<SswRequestSqlDTO> requestList = Collections.singletonList(sswRequestSqlDTO);

        // ✅ SQL 실행 (DB 조회)
        SswResponseDTO responseDTO = null;
        try {
            responseDTO = sswService.ssw0002(requestList, false);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        log.debug("responseDTO: {}", responseDTO);

        // ✅ 결과에서 특정 키 값 추출
        return extractValues(responseDTO, keysToExtract);
    }

    /**
     * 응답에서 특정 키 목록의 값을 추출하는 메서드 (키 명시)
     * 
     * @param response      SswResponseDTO 응답 객체
     * @param keysToExtract 추출할 키 목록
     * @return 추출된 값 (Map 형태)
     */
    public Map<String, Object> extractValues(SswResponseDTO response, List<String> keysToExtract) {
        Map<String, Object> result = new HashMap<>();

        if (response == null || response.getResData() == null) {
            return result;
        }

        for (SswResponseDataDTO resData : response.getResData()) {
            if (resData.getData() == null)
                continue;

            for (Map<String, Object> dataEntry : resData.getData()) {
                Object dataObject = dataEntry.get("data");
                if (dataObject instanceof Map<?, ?> finalDataMap) {
                    for (String key : keysToExtract) {
                        if (finalDataMap.containsKey(key)) {
                            result.put(key, finalDataMap.get(key));
                        }
                    }
                }
            }
        }
        // 응답 코드(rtnCode)도 함께 반환
        result.put("rtnCode", response.getRtnCode());
        return result;
    }

    /**
     * 응답에서 특정 키 목록의 값을 추출하는 메서드 (전체)
     * 
     * @param response SswResponseDTO 응답 객체
     * @return 추출된 값 (Map 형태)
     */
    public SswResponseDataDTO extractValuesAll(SswResponseDataDTO response) {
        SswResponseDataDTO finalResult = new SswResponseDataDTO();

        List<Map<String, Object>> resultList = new ArrayList<>();
        Map<String, Object> result = new HashMap<>();

        if (response == null) {
            return finalResult;
        }

        for (Map<String, Object> dataEntry : response.getData()) {
            if (!dataEntry.containsKey("data"))
                continue;

            Object dataObject = dataEntry.get("data");
            if (!(dataObject instanceof List<?> dataList))
                continue;

            for (Object innerData : dataList) {
                if (!(innerData instanceof Map<?, ?> innerMap))
                    continue;

                Object innerDataObject = innerMap.get("data");

                if (innerDataObject instanceof Map<?, ?> finalDataMap) {

                    result.put("data", finalDataMap);
                }
            }
        }

        result.put("return_cd", response.getData().get(0).get("return_cd"));
        resultList.add(result);

        finalResult.setSqlId(response.getSqlId());
        finalResult.setData(resultList);

        return finalResult;
    }
}
