package saas.win.SaaSwin.chart.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.chart.document.ChartTestDocument;
import saas.win.SaaSwin.chart.service.ChartTestService;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequestMapping("/{rprsOgnzNo}")
@RequiredArgsConstructor
public class ChartTestController {

    private final ChartTestService chartTestService;

    // 차트 데이터 조회
    @Operation(summary = "전체 차트 데이터조회", description = "전체 차트 데이터조회하기")
    @Description("전체 차트 데이터조회하기")
    @PostMapping("/api/es/rechart/searchTestChart")
    public ResponseEntity<?> searchTestChart(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody Map<String, Object> param) {
        try {
            List<ChartTestDocument> result = chartTestService.searchTestChart(param);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("검색 중 오류 발생: " + e.getMessage());
        }
    }
    // 차트 데이터 찾기
    @Operation(summary = "id로 차트 데이터조회", description = "id로 차트 데이터조회하기")
    @Description("id로 차트 데이터조회하기")
    @PostMapping("/api/es/rechart/searchTestChartById")
    public ResponseEntity<?> searchTestChartById(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestParam String id) {
        try {
            ChartTestDocument result = chartTestService.searchTestChartById(id);
            return ResponseEntity.ok(result);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("조회 중 오류 발생: " + e.getMessage());
        }
    }
    // 차트 데이터 생성
    @Operation(summary = "차트 데이터 생성", description = "차트 데이터 생성하기")
    @Description("차트 데이터 생성하기")
    @PostMapping("/api/es/rechart/saveChartTest")
    public ResponseEntity<?> saveChartTest(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody ChartTestDocument doc) {
        try {
            chartTestService.saveChartTest(doc);
            return ResponseEntity.ok("문서 저장 및 인덱스 처리 완료");
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("저장 중 오류 발생: " + e.getMessage());
        }
    }
    // 차트 데이터 수정
    @Operation(summary = "차트 데이터 수정", description = "차트 데이터 수정하기")
    @Description("차트 데이터 수정하기")
    @PostMapping("/api/es/rechart/updateChartTest")
    public ResponseEntity<?> updateChartTest(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody Map<String, Object> body) {
        try {
            // 1. id는 최상위에 있어야 합니다.
            String id = String.valueOf(body.get("id"));
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body("id는 필수입니다.");
            }
    
            // 2. 실제 수정할 내용은 "doc" 키 안에 담겨야 합니다.
            Map<String, Object> data = (Map<String, Object>) body.get("doc");
            if (data == null || data.isEmpty()) {
                return ResponseEntity.badRequest().body("수정할 필드가 없습니다.");
            }
    
            // 3. 서비스 호출
            chartTestService.updateDocument(id, data);
    
            return ResponseEntity.ok("문서 수정 처리 완료");
    
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("수정 중 오류 발생: " + e.getMessage());
        } catch (ClassCastException ce) {
            return ResponseEntity.badRequest().body("data 형식이 잘못되었습니다.");
        }
    }
    
    // 차트 데이터 삭제
    @Operation(summary = "차트 데이터 삭제", description = "차트 데이터 삭제하기")
    @Description("차트 데이터 삭제하기")
    @DeleteMapping("/api/es/rechart/deleteById")
    public ResponseEntity<?> deleteById(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestParam String id) {
        try {
            chartTestService.deleteById(id);
            return ResponseEntity.ok("문서 및 인덱스 삭제 처리 완료");
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("삭제 중 오류 발생: " + e.getMessage());
        }
    }
}
