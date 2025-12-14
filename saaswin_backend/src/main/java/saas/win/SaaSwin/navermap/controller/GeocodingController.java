package saas.win.SaaSwin.navermap.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.navermap.dto.request.GeocodingRequestDTO;
import saas.win.SaaSwin.navermap.service.GeocodingService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseObjectDTO;

@RestController
@RequestMapping("/{rprsOgnzNo}/api")
@RequiredArgsConstructor
public class GeocodingController {

    private final GeocodingService geocodingService;

    @Operation(summary = "도로명 주소 경도, 위도 추출", description = "네이버 맵스 - 도로명 주소 출발지, 도착지의 경도와 위도로 변경")
    @Description("네이버 맵스 - 도로명 주소 출발지, 도착지의 경도와 위도로 변경")
    @PostMapping("/geocode") // POST 방식 사용
    public ResponseEntity<SswResponseObjectDTO> getDrivingRoute(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody GeocodingRequestDTO requestDTO) {

        SswResponseObjectDTO responseDTO  = geocodingService.getGeocode(requestDTO);

        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }
}
