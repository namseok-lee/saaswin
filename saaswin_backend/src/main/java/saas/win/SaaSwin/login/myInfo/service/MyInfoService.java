package saas.win.SaaSwin.login.myInfo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import saas.win.SaaSwin.login.myInfo.dto.ChangePasswordResponseDTO;
import saas.win.SaaSwin.login.myInfo.dto.MyInfoResponseDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.service.SswService;
import saas.win.SaaSwin.util.SswUtils;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyInfoService {

    private final SswService sswService;

    public SswResponseDTO myInfo(SswRequestSqlDTO dto) {

//        MyInfoResponseDTO result = new MyInfoResponseDTO();
//        HashMap<String, Object> map = new HashMap<>();

        ArrayList<SswRequestSqlDTO> list = new ArrayList<>();
        list.add(dto);
        try {
            SswResponseDTO response = sswService.ssw0002(list, false);
//            log.debug(response.getResData().get(0).getData());
            log.debug(response.toString());
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        // TODO: response 값 나중에 받아오는 값으로 변경 예정
//        result.setUser_name("이경환");
//        result.setUser_id("khwan929@win.co.kr");
//        result.setTelNo("01077467370");
//        result.setExpireDate("25-05-01");
//        result.setLastChangePassword("25-02-11");
//
//        map.put("data", result);
//
//        return SswUtils.SswResponse(map);
        return null;
    }

    public SswResponseDTO changePassword(SswRequestSqlDTO dto) {
        HashMap<String, Object> map = new HashMap<>();
        ChangePasswordResponseDTO result = new ChangePasswordResponseDTO();
        result.setPassFail("성공");
        map.put("data", result);

        if(result.getPassFail().equals("실패")){
            result.setPassFail("실패");

            return SswUtils.SswResponse(map);
        }

        return SswUtils.SswResponse(map);
    }
}
