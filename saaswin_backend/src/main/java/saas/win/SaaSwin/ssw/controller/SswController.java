package saas.win.SaaSwin.ssw.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
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
public class SswController {

    @Value("${image.emp.folder}")
    private String imageEmpFolder;

    private final SswService sswService;

    @Operation(summary = "화면정보호출", description = "화면정보를 호출한다.")
    @Description("화면 정보 호출")
    @PostMapping("/api/ssw/0001")
    public ResponseEntity<SswResponseObjectDTO> ssw0001(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody SswRequestObjectDTO dto) throws ParseException, SQLException {
        // return ResponseEntity.status(HttpStatus.OK).header("Received-Header", headerValue).body("Request body: " + body);
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw0001(dto));
    }

    @Operation(summary = "Sql 호출 - 기존과 동일. 함수만호출 - 그리드용 pipeline", description = "sqlId로 조회한다.")
    @Description("Sql 호출 - 조회")
    @PostMapping("/api/ssw/0002")
    public ResponseEntity<SswResponseDTO> ssw0002(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException {
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw0002(dtoList, true));
    }
    @Operation(summary = "Sql 호출 - 기존과 동일. 함수만호출", description = "sqlId로 조회한다.")
    @Description("Sql 호출 - 조회")
    @PostMapping("/api/ssw/0022")
    public ResponseEntity<SswResponseDTO> ssw0022(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException {
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw0002(dtoList, false));
    }

    @Operation(summary = "Sql 호출 - 기존과 동일. 함수만호출 - 그리드용 pipeline(급여임시)", description = "sqlId로 조회한다.")
    @Description("Sql 호출 - 조회")
    @PostMapping("/api/ssw/00002")
    public ResponseEntity<SswResponseDTO> ssw00002(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException {
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw00002(dtoList, true));
    }
    @Operation(summary = "Sql 호출 - 기존과 동일. 함수만호출(급여임시)", description = "sqlId로 조회한다.")
    @Description("Sql 호출 - 조회")
    @PostMapping("/api/ssw/00022")
    public ResponseEntity<SswResponseDTO> ssw00022(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException {
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw00002(dtoList, false));
    }

    @Operation(summary = "공통 조회 api", description = "공통 조회 api - 그리드용(pipeline적용 - json객체만가능")
    @Description("공통 조회 api")
    @PostMapping("/api/ssw/0005")
    public ResponseEntity<SswResponseDTO> ssw0005(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException, SQLException {
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw0005(dtoList, true));
    }

    @Operation(summary = "공통 조회 api", description = "공통 조회 api - 데이터용(pipleline미적용 - json배열가능)")
    @Description("공통 조회 api")
    @PostMapping("/api/ssw/0055")
    public ResponseEntity<SswResponseDTO> ssw0055(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException, SQLException {
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw0005(dtoList, false));
    }

    @Operation(summary = "공통 저장 api", description = "공통 저장 api")
    @Description("공통 저장 api")
    @PostMapping("/api/ssw/0006")
    public ResponseEntity<SswResponseDTO> ssw0006(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<SswRequestSqlDTO> dtoList) throws ParseException, SQLException {
        return ResponseEntity.status(HttpStatus.OK).body(sswService.ssw0006(dtoList));
    }

    @Operation(summary = "이미지 테스트", description = "이미지 뷰 테스트.")
    @Description("이미지 테스트")
    @GetMapping("/api/image/{imageName}")
    public ResponseEntity<Resource> imageTest(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @PathVariable String imageName) throws ParseException {
        try {
            Path imageStorageLocation = Paths.get(imageEmpFolder);
            log.debug("imageEmpFolder", imageEmpFolder);

            Path filePath = imageStorageLocation.resolve(imageName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
