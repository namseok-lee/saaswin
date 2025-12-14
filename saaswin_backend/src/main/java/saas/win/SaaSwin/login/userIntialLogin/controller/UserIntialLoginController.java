package saas.win.SaaSwin.login.userIntialLogin.controller;

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
import saas.win.SaaSwin.login.userIntialLogin.service.UserIntialLoginService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.text.ParseException;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class UserIntialLoginController {
    private final UserIntialLoginService service;

    @Operation(summary = "유저 최초 로그인", description = "최초 로그인 진행시 팝업 및 마이페이지로 이동")
    @Description("최초 로그인 진행시 팝업 및 내정보 페이지로 이동")
    @PostMapping("api/userInitial")
    public ResponseEntity<SswResponseDTO> userInitial(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody SswRequestSqlDTO dto) throws ParseException {
        log.debug("sqlId {}", dto.getSqlId() );
        log.debug("params {}", dto.getParams() );

        return ResponseEntity.status(HttpStatus.OK).body(service.initial(dto));
    }
}
