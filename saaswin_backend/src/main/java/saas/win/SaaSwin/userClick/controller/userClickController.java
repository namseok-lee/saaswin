package saas.win.SaaSwin.userClick.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Description;
import org.springframework.web.bind.annotation.*;
import saas.win.SaaSwin.userClick.service.userClickService;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class userClickController {
    
    private final userClickService userClickService;

    @Operation(summary = "userClick 로그관리 저장", description = "userClick 로그관리를 저장한다.")
    @Description("userClick 로그관리 저장")
    @PostMapping("/api/userClick/insertUserClick")
    public String getLanguageMessages(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody Map<String, String> dto, HttpServletRequest request) throws ParseException {
        // 현재 시간 설정 (yyyyMMddHHmmss)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String dtValue = LocalDateTime.now().format(formatter);

        // 클라이언트 IP 추출
        String forwardedIp = request.getHeader("X-Forwarded-For");
        String clientIp = Optional.ofNullable(forwardedIp)
                .filter(fwd -> !fwd.isBlank())
                .map(fwd -> fwd.split(",")[0].trim())
                .orElse(request.getRemoteAddr());

        String ipv4 = "";
        String ipv6 = "";

        if (clientIp.contains(":")) {
            ipv6 = clientIp;

            if ("0:0:0:0:0:0:0:1".equals(clientIp)) {
                ipv4 = "127.0.0.1";
            } else if (clientIp.startsWith("::ffff:")) {
                ipv4 = clientIp.substring(7);
            } else if (clientIp.contains(".")) {
                ipv4 = clientIp.substring(clientIp.lastIndexOf(":") + 1);
            }
        } else {
            ipv4 = clientIp;
        }

        // dto 구성
        dto.put("dt", dtValue);
        dto.put("ipv4", ipv4);
        dto.put("ipv6", ipv6);

        // ❗ 빈 문자열 또는 null인 ip 필드는 반드시 제거 (Elasticsearch type: ip는 허용하지 않음)
        Stream.of("ipv4", "ipv6").forEach(field -> {
            String value = dto.get(field);
            if (value == null || value.trim().isEmpty()) {
                dto.remove(field);
            }
        });

        // 저장
        userClickService.saveClickLog(dto);
        return "success";
    }

    @DeleteMapping("/api/userClick/deleteUserClick")
    public String deleteClickLogById(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestParam String id) {
        userClickService.deleteClickLogById("saaswin_user_click_win", id);
        return "success";
    }
}
