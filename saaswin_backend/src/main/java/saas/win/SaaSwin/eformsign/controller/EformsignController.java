package saas.win.SaaSwin.eformsign.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.eformsign.dto.EformsignDTO;
import saas.win.SaaSwin.eformsign.service.EformsignService;
import saas.win.SaaSwin.google.calendar.dto.GoogleCalendarDTO;
import saas.win.SaaSwin.google.calendar.service.GoogleCalendarService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
@Slf4j
public class EformsignController {

    private final EformsignService eformsignService;

    @Operation(summary = "이폼사인 템플릿등록", description = "이폼사인 템플릿등록")
    @Description("이폼사인 템플릿등록")
    @PostMapping("/api/efs/template/insert")
    public ResponseEntity<SswResponseDTO> template_insert(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody EformsignDTO dto) throws SQLException, ParseException, UnsupportedEncodingException, NoSuchAlgorithmException, InvalidKeySpecException, SignatureException, InvalidKeyException {
        return ResponseEntity.status(HttpStatus.OK).body(eformsignService.template_insert(dto));
    }

    @Operation(summary = "이폼사인 토큰가져오기", description = "이폼사인 토큰가져오기")
    @Description("이폼사인 토큰가져오기")
    @PostMapping("/api/efs/gettoken")
    public ResponseEntity<Map<String, Object>> gettoken(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody EformsignDTO dto) throws SQLException, ParseException, UnsupportedEncodingException, NoSuchAlgorithmException, InvalidKeySpecException, SignatureException, InvalidKeyException {
        return ResponseEntity.status(HttpStatus.OK).body(eformsignService.gettoken(dto));
    }


}
