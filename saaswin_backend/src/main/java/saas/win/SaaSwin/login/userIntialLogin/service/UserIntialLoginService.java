package saas.win.SaaSwin.login.userIntialLogin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import saas.win.SaaSwin.login.userIntialLogin.dto.UserInitialLoginResponseDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.util.SswUtils;

import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class UserIntialLoginService {
    private final SqlService sqlService;
    public SswResponseDTO initial(SswRequestSqlDTO dto) throws ParseException {

//        List<Map<String, Object>> response = sqlService.executeQuery_select(dto);
        UserInitialLoginResponseDTO result = new UserInitialLoginResponseDTO();
        HashMap<String, Object> map = new HashMap<>();

        //TODO: response 값 나중에 받아오는 값으로 변경 예정.

        result.setName("이경환");
        result.setPopUpText("님, 인사잇에 처음 오신것을 환영합니다!\n" +
                "새로운 업무를 시작하기 전,\n" +
                "보다 안전한 서비스 이용을 위해\n" +
                "반드시 비밀번호를 변경해주세요\n" +
                "비밀번호 변경 위치: 설정 > 내 설정 > 내 로그인 화면");

        map.put("data", result);

        return SswUtils.SswResponse(map);
    }
}
