package saas.win.SaaSwin.eformsuite.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jodconverter.office.OfficeException;
import org.springframework.context.annotation.Description;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import saas.win.SaaSwin.code.dto.CodeDTO;
import saas.win.SaaSwin.code.service.CodeService;
import saas.win.SaaSwin.eformsuite.dto.EformsuiteDTO;
import saas.win.SaaSwin.eformsuite.service.EformsuiteService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
@Slf4j
public class EformsuiteController {

    private final EformsuiteService eformsuiteService;

    @Operation(summary = "파일저장", description = "파일을 저장한다.")
    @Description("파일저장")
    @PostMapping("/api/eformsuite/file/insert")
    public ResponseEntity<String> fileInsert(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "params", required = false) Map<String, Object> params) throws ParseException, SQLException, IOException, InterruptedException, OfficeException {

        return ResponseEntity.status(HttpStatus.OK).body(eformsuiteService.fileInsert(file, params));
    }

    @Operation(summary = "템플릿 저장", description = "템플릿을 저장한다.")
    @Description("템플릿저장")
    @PostMapping("/api/eformsuite/template/insert")
    public ResponseEntity<SswResponseDTO> templateInsert(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody Map<String, Object> params) {
        return ResponseEntity.status(HttpStatus.OK).body(eformsuiteService.templateInsert(params));
    }

    @Operation(summary = "템플릿 복사", description = "템플릿을 복사한다.")
    @Description("템플릿복사")
    @PostMapping("/api/eformsuite/template/copy")
    public ResponseEntity<SswResponseDTO> templateCopy(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody Map<String, Object> params) {
        return ResponseEntity.status(HttpStatus.OK).body(eformsuiteService.templateCopy(params));
    }
}
