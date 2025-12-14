package saas.win.SaaSwin.aligo.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.aligo.dto.AligoRequestDTO;
import saas.win.SaaSwin.aligo.service.AligoService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
@Slf4j
public class AligoController {

    @Value("${image.emp.folder}")
    private String imageEmpFolder;

    private final AligoService aligoService;



//    @Operation(summary = "알리고API", description = "알림톡 저장")
//    @Description("알리고API연결")
//    @PostMapping("/api/aligo/talk")
//    public ResponseEntity<SswResponseDTO> aligoApi(@RequestBody List<AligoDTO> reqData) {
//        return ResponseEntity.status(HttpStatus.OK).body(aligoService.sendAligoKakaoTalk(reqData));
//    }


    @Operation(summary = "알리고 전송 API", description = "알림톡 저장")
    @Description("알리고 전송 API")
    @PostMapping("/api/aligo/talk")
    public ResponseEntity<SswResponseDTO> aligoApi(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<AligoRequestDTO> reqData){
        return ResponseEntity.status(HttpStatus.OK).body(aligoService.sendAligoTalk(reqData));
    }


    // 1시간마다 실행
    // @Scheduled(fixedRate = 3600000)
    @Operation(summary = "알리고 배치 API", description = "알림톡 상세정보 저장")
    @Description("알리고배치 API")
    @GetMapping("/api/aligo/arrangement")
    public void arrangementFailSendTalk(@PathVariable("rprsOgnzNo") String rprsOgnzNo) throws IOException, ParseException {
        aligoService.checkSendKakaotalk();
    }
}
