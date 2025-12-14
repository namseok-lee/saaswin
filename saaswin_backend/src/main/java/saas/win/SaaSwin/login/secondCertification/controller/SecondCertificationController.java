package saas.win.SaaSwin.login.secondCertification.controller;

import java.text.ParseException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import saas.win.SaaSwin.login.secondCertification.dto.SecondCertificationRequestDTO;
import saas.win.SaaSwin.login.secondCertification.dto.SecondCertificationResponseDTO;
import saas.win.SaaSwin.login.secondCertification.service.secondCertificationService;

@RestController
@RequestMapping("/{rprsOgnzNo}")
@RequiredArgsConstructor
public class SecondCertificationController {

    private final secondCertificationService secondCertificationService;

    @PostMapping("/api/secondCertification/send")
    public ResponseEntity<SecondCertificationResponseDTO> send(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody SecondCertificationRequestDTO requestDto) throws ParseException {
        return ResponseEntity.ok(secondCertificationService.sendCertification(requestDto));
    }

    @PostMapping("/api/secondCertification/check")
    public ResponseEntity<SecondCertificationResponseDTO> check(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody SecondCertificationRequestDTO requestDto) throws ParseException {
        return ResponseEntity.ok(secondCertificationService.checkCertification(requestDto));
    }
}
