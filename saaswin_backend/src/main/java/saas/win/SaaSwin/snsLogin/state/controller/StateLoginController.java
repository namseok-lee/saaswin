package saas.win.SaaSwin.snsLogin.state.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.snsLogin.state.dto.TypeRequestDTO;
import saas.win.SaaSwin.snsLogin.state.service.StateLoginService;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

@Slf4j
@RestController
@RequestMapping("/{rprsOgnzNo}/api/auth/state")
@RequiredArgsConstructor
public class StateLoginController {
    private final StateLoginService naverLoginService;

    // state 값을 csrf 방지를 위해서 서버단에서 생성해서 보관
    @PostMapping("/generate-state")
    public SswResponseDTO generateState(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody TypeRequestDTO dto) {

        log.debug("컨트롤러 실행");
        log.debug("type: {}", dto.getType());

        return naverLoginService.generateState(dto.getType());
    }

}