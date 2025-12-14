package saas.win.SaaSwin.navermap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.navermap.dto.request.GeocodingRequestDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseObjectDTO;

import java.net.URI;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeocodingService {

    @Value("${naver.map.api.client-id}")
    private String clientId;

    @Value("${naver.map.api.client-secret}")
    private String clientSecret;

    public SswResponseObjectDTO getGeocode(GeocodingRequestDTO requestDTO) {
        try {

            // 검색값 인코딩 (퍼센트 인코딩형식)
            String encodedQuery = URLEncoder.encode(requestDTO.getQuery(), "UTF-8");

            // URI 생성
//            URI uri = new URI("https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=" + encodedQuery);
            URI uri = new URI("https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=" + encodedQuery);
            // 헤더 설정 (클라이어트 아이디와 시크릿키를 헤더에 포함, json 형식 지정)
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-NCP-APIGW-API-KEY-ID", clientId);
            headers.set("X-NCP-APIGW-API-KEY", clientSecret);
            headers.set("Content-Type", "application/json");

            // 스프링에서 제공하는 HTTP 요청/ 응답을 위한 클래스
            RestTemplate restTemplate = new RestTemplate();

            // HTTP 요청 객체 생성 파라미터( Body, Header )로 값 저장
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

            // API 호출 ( StatusCode, body, headers ) 반환
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

            // 응답 처리
            if (response.getStatusCode() == HttpStatus.OK) {
                // Jackson의 ObjectMapper를 사용해 JSON String 형식을 JSON 객체 형식으로 변환
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode addresses = rootNode.get("addresses"); // 배열 저장

                if (addresses != null && addresses.isArray() && addresses.size() > 0) {
                    JsonNode firstAddress = addresses.get(0);
                    String x = firstAddress.get("x").asText();
                    String y = firstAddress.get("y").asText();
                    System.out.println("x result :" + x);
                    System.out.println("y result :" + y);

                    Map<String, Object> responseData = new HashMap<>();
                    responseData.put("x", x);
                    responseData.put("y", y);

                    SswResponseObjectDTO res = new SswResponseObjectDTO();
                    res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
                    res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
                    res.setResData(responseData);

                    return res;
                } else {
                    throw new RuntimeException("좌표를 찾을 수 없습니다.");
                }
            } else {
                throw new RuntimeException("API 호출 실패: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Geocode 처리 중 오류 발생: " + e.getMessage(), e);
        }
    }
}