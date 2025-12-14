package saas.win.SaaSwin.loginSetting.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.loginSetting.service.SettingService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class SettingController {
    private final SettingService service;

    @Operation(summary = "비밀번호 재설정 링크 발송", description = "비밀번호 재설정 링크 발송")
    @Description("비밀번호 재설정 링크 발송")
    @PostMapping("api/mailSending")
    public ResponseEntity<SswResponseDTO> myInfo(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody SswRequestSqlDTO dto){
        log.debug("sqlId {}", dto.getSqlId() );
        log.debug("params {}", dto.getParams() );
        //TODO: 여기서 이름과 이메일을 받아서 진행할 예정

        return ResponseEntity.status(HttpStatus.OK).body(service.setting(dto));
    }
}
