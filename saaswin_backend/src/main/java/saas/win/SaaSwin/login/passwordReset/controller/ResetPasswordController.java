package saas.win.SaaSwin.login.passwordReset.controller;

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
import saas.win.SaaSwin.login.passwordReset.dto.request.AuthCodeRequestDTO;
import saas.win.SaaSwin.login.passwordReset.dto.request.InfoCheckRequestDTO;
import saas.win.SaaSwin.login.passwordReset.dto.request.AuthenticationCheckDTO;
import saas.win.SaaSwin.login.passwordReset.service.ResetPasswordService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.text.ParseException;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class ResetPasswordController {

    private final ResetPasswordService service;

    @Operation(summary = "인증번호 검증", description = "비밀번호 재설정 - 인증번호 검증")
    @Description("비밀번호 재설정 인증번호 검증")
    @PostMapping("api/authCode")
    public ResponseEntity<SswResponseDTO> authCodeCheck(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody AuthCodeRequestDTO dto) throws ParseException {
        log.debug("authCode: {}",dto.getAuthCode());

        return ResponseEntity.status(HttpStatus.OK).body(service.doCheck(dto));
    }

    @Operation(summary = "인증값 검증", description = "비밀번호 재설정 - 아이디, 생년월일, 휴대폰번호 검증")
    @Description("비밀번호 재설정 아이디, 생년월일, 휴대폰번호 검증")
    @PostMapping("api/infoCheck")
    public ResponseEntity<SswResponseDTO> infoCheck(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody InfoCheckRequestDTO dto) throws ParseException {
        log.debug("email {}", dto.getUser_id());
        log.debug("birthDate {}", dto.getBrdt());
        log.debug("phone {}", dto.getTelno());

        return ResponseEntity.status(HttpStatus.OK).body(service.infoCheck(dto));
    }

    @Operation(summary = "비밀번호 초기화", description = "비밀번호 재설정 - 비밀번호 초기화")
    @Description("비밀번호 재설정 - 비밀번호 초기화")
    @PostMapping("api/initial")
    public ResponseEntity<SswResponseDTO> authenticationCheck(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody AuthenticationCheckDTO dto){
        return ResponseEntity.status(HttpStatus.OK).body(service.authenticationCheck(dto));
    }

    @Operation(summary = "비밀번호 업데이트", description = "비밀번호 재설정 - 비밀번호 업데이트")
    @Description("비밀번호 재설정 - 비밀번호 업데이트")
    @PostMapping("api/resetPassword")
    public ResponseEntity<SswResponseDTO> updatePassword(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody Map<String, Object> param){
        Map<String, Object> dto = (Map<String, Object>) param.get("params");
        return ResponseEntity.status(HttpStatus.OK).body(service.updatePassword(dto));
    }


}
