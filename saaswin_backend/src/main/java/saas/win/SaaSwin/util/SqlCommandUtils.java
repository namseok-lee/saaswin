package saas.win.SaaSwin.util;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import org.postgresql.util.PGobject;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class SqlCommandUtils {

    // jsonb type이 있다면 list map 형태로 만들어서 리턴
    public static List<Map<String, Object>> preprocessJsonbFields(List<Map<String, Object>> list) {
        if(list == null) return null;

        List<Map<String, Object>> processedList = new ArrayList<>();

        Gson gson = new Gson();

        for (Map<String, Object> map : list) {
            Map<String, Object> processedMap = new HashMap<>();

            for (Map.Entry<String, Object> entry : map.entrySet()) {
                String key = entry.getKey().toLowerCase();
                Object value = entry.getValue();

                if (value instanceof PGobject) {
                    if ("jsonb".equalsIgnoreCase(((PGobject) value).getType()) || "json".equalsIgnoreCase(((PGobject) value).getType())) {
                        String jsonString = ((PGobject) value).getValue();
                        try {
                            JsonElement jsonElement = JsonParser.parseString(jsonString);
                            if (jsonElement.isJsonObject()) {
                                Map<String, Object> parsedMap = gson.fromJson(jsonElement, Map.class);
                                processedMap.put(key, parsedMap);
                            } else if (jsonElement.isJsonArray()) {
                                List<Object> parsedList = gson.fromJson(jsonElement, List.class);
                                processedMap.put(key, parsedList);
                            } else {
                                // Handle other JSON types if necessary
                                processedMap.put(key, jsonString);
                            }
                        } catch (JsonSyntaxException e) {
                            // Parsing failed, keep the original valueMap
                            processedMap.put(key, value);
                        }
                    }
                }
                else {
                    // Non-map value, keep original
                    processedMap.put(key, value);
                }

            }

            processedList.add(processedMap);
        }

        return processedList;
    }

    // full json 형태로 생성 - jsonb타입의 경우, columnm|key
    public static List<Map<String, Object>> makeFullJson(List<Map<String, Object>> list) {
        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();

        for(Map<String, Object> map : list) {
            Map<String, Object> resultMap = new HashMap<>();

            for (Map.Entry<String, Object> entry : map.entrySet()) {
                String key = entry.getKey().toLowerCase();
                Object value = entry.getValue();

                if(value instanceof Map<?, ?>) {
                    for (Map.Entry<String, Object> entry2 : ((Map<String, Object>) value).entrySet()) {
                        String newKeyName = key.toLowerCase() + "|" + entry2.getKey().toLowerCase();
                        resultMap.put(newKeyName, entry2.getValue());
                    }
                }
                else if(value instanceof List<?>) {
                    for (Map<String, Object> entry2 : ((List<Map<String, Object>>) value)) {
                        for (Map.Entry<String, Object> entry3 : ((Map<String, Object>) entry2).entrySet()) {
                            String newKeyName = key.toLowerCase() + "|" + entry3.getKey().toLowerCase();
                            resultMap.put(newKeyName, entry3.getValue());
                        }
                    }
                }
                else {
                    resultMap.put(key, value);
                }
            }

            resultList.add(resultMap);
        }

        return resultList;
    }

    // map의 key값이 | 파이프라인이 붙어오면 파이프라인왼쪽이 field이고 우측이 json의 요소로 생각하여 map을 다시만든다.
    public static List<Map<String, Object>> makeJsonbTypeListMap(List<Map<String, Object>> list) {
        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();

        for(Map<String, Object> map : list) {
            Map<String, Object> resultMap = new HashMap<>();

            for (Map.Entry<String, Object> entry : map.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();

                if (key.contains("|")) {
                    String[] parts = key.split("\\|");
                    String parentKey = parts[0];
                    String childKey = parts[1];

                    // 상위 Map에 해당하는 키가 이미 존재하는지 확인
                    Map<String, Object> childMap;
                    if (resultMap.containsKey(parentKey)) {
                        childMap = (Map<String, Object>) resultMap.get(parentKey);
                    } else {
                        childMap = new HashMap<>();
                        resultMap.put(parentKey, childMap);
                    }

                    // 하위 Map에 값 추가
                    childMap.put(childKey, value);
                } else {
                    // 상위 Map에 바로 값 추가
                    resultMap.put(key, value);
                }
            }

            resultList.add(resultMap);
        }

        return resultList;
    }
}
