package saas.win.SaaSwin.login.verification.controller;

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
import saas.win.SaaSwin.login.verification.dto.request.LoginRequestDTO;
import saas.win.SaaSwin.login.verification.service.LoginService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
//import saas.win.SaaSwin.sys.object.dto.SysObjectRequestDTO;
//import saas.win.SaaSwin.sys.object.dto.SysObjectResponseDTO;

import java.sql.SQLException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class LoginController {

    private final LoginService loginService;

    @Operation(summary = "기본 로그인", description = "로그인 - 기본 로그인")
    @Description("로그인 - 기본 로그인")
    @PostMapping("/api/login")
    public ResponseEntity<SswResponseDTO> objectSave(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody LoginRequestDTO dto) throws ParseException, SQLException {
        dto.setLogin_type("generic");
        return ResponseEntity.status(HttpStatus.OK).body(loginService.login(dto));
    }

    @Operation(summary = "로그인 유저 대표회사 조회", description = "로그인 유저 대표회사 조회")
    @Description("로그인 유저 대표회사 조회")
    @PostMapping("/api/findRprsOgnzNo")
    public ResponseEntity<List<Map<String, Object>>> findRprsOgnzNo(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<Map<String, Object>> dto) throws ParseException, SQLException {
        // 첫 번째 요소 가져오기
        Map<String, Object> firstItem = dto.get(0);
        // params 배열 가져오기
        List<Map<String, Object>> params = (List<Map<String, Object>>) firstItem.get("params");
        // 첫 번째 파라미터 객체 가져오기
        Map<String, Object> userParam = params.get(0);
        // user_id 추출
        String userId = (String) userParam.get("user_id");
        // 서비스 호출
        List<Map<String, Object>> result = loginService.findRprsOgnzNo(userId);

        // fetcherPost 호환 응답 생성
        Map<String, Object> response = new HashMap<>();
        response.put("rtnCode", "00000");
        response.put("rtnMsg", "성공");
        response.put("resData", result);

        return ResponseEntity.status(HttpStatus.OK).body(loginService.findRprsOgnzNo(userId));
    }

    @Operation(summary = "사용자 생성", description = "사용자 생성")
    @Description("사용자 생성")
    @PostMapping("/api/createUser")
    public ResponseEntity<List<Map<String, Object>>> createUser(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<Map<String, Object>> dto) throws ParseException, SQLException {
        return ResponseEntity.status(HttpStatus.OK).body(loginService.createUser(dto));
    }
}
