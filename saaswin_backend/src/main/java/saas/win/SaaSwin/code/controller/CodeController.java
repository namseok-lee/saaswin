package saas.win.SaaSwin.code.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.code.dto.CodeDTO;
import saas.win.SaaSwin.code.service.CodeService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestObjectDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseObjectDTO;
import saas.win.SaaSwin.ssw.service.SswService;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
@Slf4j
public class CodeController {

    private final CodeService codeService;

    @Operation(summary = "코드정보 호출", description = "코드정보를 호출한다.")
    @Description("코드정보 호출")
    @PostMapping("/api/code/search")
    public ResponseEntity<SswResponseDTO> search(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody CodeDTO dto) throws ParseException, SQLException, JsonProcessingException {
        // return ResponseEntity.status(HttpStatus.OK).header("Received-Header", headerValue).body("Request body: " + body);
        return ResponseEntity.status(HttpStatus.OK).body(codeService.search(dto));
    }

    @Operation(summary = "코드정보 리셋", description = "코드정보를 리셋한다.")
    @Description("코드정보 리셋")
    @PostMapping("/api/code/reset")
    public ResponseEntity<SswResponseDTO> reset(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody CodeDTO dto) throws ParseException, SQLException, JsonProcessingException {
        // return ResponseEntity.status(HttpStatus.OK).header("Received-Header", headerValue).body("Request body: " + body);
        return ResponseEntity.status(HttpStatus.OK).body(codeService.reset(dto));
    }

}
