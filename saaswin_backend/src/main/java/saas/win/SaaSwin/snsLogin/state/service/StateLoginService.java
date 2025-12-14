package saas.win.SaaSwin.snsLogin.state.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.util.SswUtils;

import java.time.Duration;
import java.util.HashMap;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StateLoginService {

    private final StringRedisTemplate redisTemplate;

    public SswResponseDTO generateState(String type) {
//        log.debug("서비스 실행");
        String state = UUID.randomUUID().toString();

        if(type.equals("login")){
            log.debug("type : {}", type);
            redisTemplate.opsForValue().set("login_"+ state, "valid", Duration.ofMinutes(5));
            log.debug(redisTemplate.opsForValue().get("login_"+state));

        } else {
            log.debug("type : {}", type);
            redisTemplate.opsForValue().set("connect_"+ state, "valid", Duration.ofMinutes(5));
            log.debug(redisTemplate.opsForValue().get("connect_"+state));

        }
        // 응답 형식 여기서 정해서 넘겨줘야함
        HashMap<String, Object> map = new HashMap<>();
        map.put("state" ,state);
        log.debug("state: {}", state);

        return SswUtils.SswResponse(map);

    }
}
