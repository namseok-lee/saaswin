package saas.win.SaaSwin.navermap.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.navermap.dto.request.DirectionRequestDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseObjectDTO;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DirectionService {
    @Value("${naver.map.api.client-id}")
    private String clientId;

    @Value("${naver.map.api.client-secret}")
    private String clientSecret;

    private final ObjectMapper objectMapper;

    public SswResponseObjectDTO getDrivingRoute(DirectionRequestDTO requestDTO) {
        try {
            // API 요청 URL 생성 (스프링에서 제공하는 UriComponentsBuilder 사용) - 인코딩 자동 처리
            String url = UriComponentsBuilder.fromHttpUrl("https://maps.apigw.ntruss.com/map-direction/v1/driving?")
                    .queryParam("start", String.format("%f,%f", requestDTO.getDepartureX(), requestDTO.getDepartureY()))
                    .queryParam("goal", String.format("%f,%f", requestDTO.getDestinationX(), requestDTO.getDestinationY()))
                    .build()
                    .toUriString();

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-NCP-APIGW-API-KEY-ID", clientId);
            headers.set("X-NCP-APIGW-API-KEY", clientSecret);
            headers.set("Content-Type", "application/json");

            // HTTP 요청 보내기
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            Map<String, Object> parsedData = objectMapper.readValue(response.getBody(), Map.class);

            SswResponseObjectDTO res = new SswResponseObjectDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
            res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
            res.setResData(parsedData); // JSON 객체로 반환

            // DrivingResponseDTO로 응답 데이터 반환
            return res;
        } catch (Exception e) {
            throw new RuntimeException("길찾기 요청 실패: " + e.getMessage(), e);
        }
    }
}