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
import saas.win.SaaSwin.navermap.dto.request.DirectionRequestDTO;
import saas.win.SaaSwin.navermap.service.DirectionService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseObjectDTO;

@RestController
@RequestMapping("/{rprsOgnzNo}/api")
@RequiredArgsConstructor
public class DirectionController {
    private final DirectionService directionService;

    @Operation(summary = "경로 검색(출발지, 도착지)", description = "네이버 맵스 - 위도, 경도를 사용한 경로 검색(출발지, 도착지)")
    @Description("네이버 맵스 - 위도, 경도를 사용한 경로 검색(출발지, 도착지)")
    @PostMapping("/driving") // POST 방식 사용
    public ResponseEntity<SswResponseObjectDTO> getDrivingRoute(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody DirectionRequestDTO requestDTO) {

        SswResponseObjectDTO responseDTO  = directionService.getDrivingRoute(requestDTO);

        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }
}
