package saas.win.SaaSwin.login.myInfo.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.login.myInfo.service.MyInfoService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class MyInfoController {
    private final MyInfoService service;

    @Operation(summary = "내 로그인 정보 페이지", description = "내 로그인 정보 페이지")
    @Description("내 로그인 정보 페이지")
    @PostMapping("api/myInfo")
    public ResponseEntity<SswResponseDTO> myInfo(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody SswRequestSqlDTO dto){
        log.debug("sqlId {}", dto.getSqlId() );
        log.debug("params {}", dto.getParams() );

        return ResponseEntity.status(HttpStatus.OK).body(service.myInfo(dto));
    }

    @Operation(summary = "비밀번호 변경", description = "내 로그인 정보 페이지 비밀번호 변경")
    @Description("내 로그인 정보 페이지 비밀번호 변경")
    @PostMapping("api/changePassword")
    public ResponseEntity<SswResponseDTO> changePassword(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody SswRequestSqlDTO dto){
        log.debug("sqlId {}", dto.getSqlId() );
        log.debug("params {}", dto.getParams() );

        return ResponseEntity.status(HttpStatus.OK).body(service.changePassword(dto));
    }
}
