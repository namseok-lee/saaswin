package saas.win.SaaSwin.loginSetting.service;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;
import saas.win.SaaSwin.util.SswUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingService {

    private final PasswordGeneratorService passwordGeneratorService;

    public SswResponseDTO setting(SswRequestSqlDTO dto) {

        String tempPassword = passwordGeneratorService.generatePassword();
        log.debug("tempPassword {}",tempPassword);

        SswResponseDTO response = new SswResponseDTO();
        response.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        response.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);

        ArrayList<Map<String, Object>> listmap = new ArrayList<>();
        Map<String, Object> map = new HashMap<>();
        map.put("data", tempPassword); // 비밀번호 저장
        listmap.add(map);

        List<SswResponseDataDTO> list = new ArrayList<SswResponseDataDTO>();
        SswResponseDataDTO sswResponseDataDTO = new SswResponseDataDTO();
        sswResponseDataDTO.setRntRowCnt(0);
        sswResponseDataDTO.setSqlId(0);
        sswResponseDataDTO.setData(listmap);
        list.add(sswResponseDataDTO);
        response.setResData(list);

        return response;

    }
}
