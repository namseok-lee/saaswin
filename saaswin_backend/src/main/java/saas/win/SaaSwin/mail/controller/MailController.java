package saas.win.SaaSwin.mail.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.mail.dto.MailDTO;
import saas.win.SaaSwin.mail.service.MailService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.text.ParseException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}/api/mail")
@Slf4j
public class MailController {

    private final MailService mailService;

    @Operation(summary = "메일 전송 API", description = "메일 전송")
    @Description("메일 전송 API")
    @PostMapping("/send")
    public ResponseEntity<SswResponseDTO> mailSend(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody MailDTO dto) throws MessagingException, ParseException {
        return ResponseEntity.status(HttpStatus.OK).body(mailService.sendMail(dto));
    }



}
