package saas.win.SaaSwin.google.calendar.controller;

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
import saas.win.SaaSwin.google.calendar.dto.GoogleCalendarDTO;
import saas.win.SaaSwin.google.calendar.service.GoogleCalendarService;
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
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
@Slf4j
public class GoogleCanlendarController {

    @Value("${image.emp.folder}")
    private String imageEmpFolder;

    private final GoogleCalendarService googleCalendarService;


    // google 캘린더 API 연결
    @Operation(summary = "구글 캘린더 API", description = "구글 캘린더 값 저장")
    @Description("구글 캘린더 일정 저장")
    @PostMapping("/api/google/calendar/insert")
    public ResponseEntity<SswResponseDTO> googleCalendar(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<GoogleCalendarDTO> dtoList) throws SQLException, ParseException {
        return ResponseEntity.status(HttpStatus.OK).body(googleCalendarService.googleCalendarApi(dtoList));
    }

}
