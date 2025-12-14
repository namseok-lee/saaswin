package saas.win.SaaSwin.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;

import java.lang.reflect.Type;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class SswUtils {


    public static Timestamp getTimestamp(String date) throws ParseException {
        return getTimestamp(date, false);
    }
    public static Timestamp getTimestamp(String date, boolean nano) throws ParseException {
        if (date == null)
            return null;
        Timestamp timestamp = null;
        try {
            timestamp = Timestamp.valueOf(date);
        } catch (Exception timestampParseException) {
            try {
                timestamp = Timestamp.valueOf(String.valueOf(date) + " 0:0:0.0");
            } catch (Exception ee) {
                try {
                    DateFormat df = DateFormat.getDateInstance();
                    timestamp = new Timestamp(df.parse(date).getTime());
                } catch (Exception parseException) {

                    date = formatRemoveDate(date);
                    int dlen = date.length();
                    String fmt = "yyyyMMddHHmmss";
                    if (date != null && date.length() >= 8) {
                        if (dlen < 10) {
                            fmt = "yyyyMMdd";
                            date = date.substring(0, 8);
                        } else if (dlen < 12) {
                            fmt = "yyyyMMddHH";
                            date = date.substring(0, 10);
                        } else if (dlen < 14) {
                            fmt = "yyyyMMddHHmm";
                            date = date.substring(0, 12);
                        } else {
                            date = date.substring(0, 14);
                        }
                    }
                    SimpleDateFormat df2 = new SimpleDateFormat(fmt);
                    try {
                        timestamp = new Timestamp(df2.parse(date).getTime());
                    } catch (ParseException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
        }

        if (timestamp != null && !nano)
            timestamp.setNanos(0);
        return timestamp;
    }

    public static String formatRemoveDate(String date) {
        StringBuffer strbuf = new StringBuffer();

        for (int i = 0; i < date.length(); i++) {
            char datechar = date.charAt(i);
            if (datechar >= '0' && datechar <= '9') {
                strbuf.append(datechar);
            }
        }
        return strbuf.toString();
    }

    // column 정보와 데이터 정보가 배열일때 매치해서 map에 넣기
    public static List<Map<String, Object>> colObjMapping(String[][] info, String[] propertyInfo) {
        List<Map<String, Object>> datas = new ArrayList<Map<String, Object>>();

        for(int i=0; i<info.length; i++) {
            Map<String, Object> data = new HashMap<String, Object>();
            for(int j=0; j<info[i].length; j++ ){
                String value = info[i][j];
                String key = propertyInfo[j];
                data.put(key, value);
            }
            datas.add(data);
        }

        return datas;
    }
    // column 정보와 데이터 정보가 배열일때 매치해서 map에 넣기
    public static Map<String, Object> colObjMapping(String[] info, String[] propertyInfo) {
        Map<String, Object> result = new HashMap<String, Object>();
        for(int i=0; i<info.length; i++ ){
            String value = info[i];
            String key = propertyInfo[i];
            result.put(key, value);
        }
        return result;
    }

    // dto를 map으로 전환
    public static <T> Map<String, Object> convertDTOToMap(T dto) {
        Gson gson = new Gson();
        // DTO를 JSON 문자열로 변환
        String jsonString = gson.toJson(dto);

        // JSON 문자열을 HashMap으로 변환
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Map<String, Object> map = gson.fromJson(jsonString, type);
        return map;
    }

    public static <T> List<Map<String, Object>> convertDTOListToMapList(List<T> dtoList) {
        Gson gson = new Gson();
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        for(T dto : dtoList) {
            // DTO를 JSON 문자열로 변환
            String jsonString = gson.toJson(dto);
            Type type = new TypeToken<Map<String, Object>>(){}.getType();
            // JSON 문자열을 HashMap으로 변환
            Map<String, Object> map = gson.fromJson(jsonString, type);
            result.add(map);
        }

        return result;
    }

    // map을 클래스로 전환
    public static <T> T convertMapToDTO(Map<String, Object> map, Class<T> dtoClass) {
        Gson gson = new Gson();
        try {
            // Map을 JSON 문자열로 변환
            String jsonString = gson.toJson(map);
            // JSON 문자열을 DTO 객체로 변환
            return gson.fromJson(jsonString, dtoClass);
        } catch(Exception e) {
            log.error("error", e);
            return null;
        }
    }

    // map 을 json string 으로
    public static String convertMapToJson(Map<String, Object> map) {
        String result = "";
        try{
            Gson gson = new Gson();
            result = gson.toJson(map);
        }
        catch (Exception e) {
            log.error("error", e);
        }
        return result;
    }

    // map 을 json string 으로
    public static Map<String, Object> convertJsonToMap(String json) {
        Map<String, Object> result = new HashMap<String, Object>();
        try{
            Gson gson = new Gson();
            Type type = new TypeToken<Map<String, Object>>(){}.getType();
            // JSON 문자열을 HashMap으로 변환
            result = gson.fromJson(json, type);
        }
        catch (Exception e) {
            log.error("error", e);
        }
        return result;
    }

    public static <T> List<T> convertMapListToDTOList(List<Map<String, Object>> mapList, Class<T> dtoClass) {
        Gson gson = new Gson();

        List<T> result = new ArrayList<T>();
        for(Map<String, Object> map : mapList) {
            // DTO를 JSON 문자열로 변환
            String jsonString = gson.toJson(map);
            // JSON 문자열을 DTO 객체로 변환
            //T dto = gson.fromJson(jsonString, dtoClass);
            result.add(gson.fromJson(jsonString, dtoClass));
        }

        return result;
    }

    // 파일에서 확장자제외한 파일명만 가져오기.
    public static String getFileNameWithoutExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(0, fileName.lastIndexOf('.'));
        }
        return fileName;
    }

    public static SswResponseDTO SswResponse(Map<String, Object> map) {
        List<Map<String, Object>> listmap = new ArrayList<Map<String, Object>>();
        listmap.add(map);

        return SswResponse(listmap);
    }

    public static SswResponseDTO SswResponse(List<Map<String, Object>> listmap) {
        SswResponseDTO result = new SswResponseDTO();
        result.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        result.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);

        List<SswResponseDataDTO> list = new ArrayList<SswResponseDataDTO>();
        SswResponseDataDTO dto = new SswResponseDataDTO();
        dto.setRntRowCnt(0);
        dto.setSqlId(0);
;
        dto.setData(listmap);
        list.add(dto);
        result.setResData(list);

        return result;
    }

    // 전화번호 포멧 변환
    public static String removeHyphens(String phoneNumber) {
        return phoneNumber.replaceAll("-", "");
    }

}
