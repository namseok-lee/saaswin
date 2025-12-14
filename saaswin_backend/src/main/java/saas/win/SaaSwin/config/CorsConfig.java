package saas.win.SaaSwin.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {



    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/*/api/**")  // 특정 경로에 대해 CORS 설정
                .allowedOriginPatterns(
                    "http://h5on.com",
                        "https://h5on.com",
                        "http://*.h5on.com",
                        "https://*.h5on.com",
                        "http://localhost:3000",
                        "http://localhost:8080",
                        "http://localhost:9001",
                        "http://218.236.10.179",
                        "https://218.236.10.179",
                        "http://saaswin.node.com",
                        "http://218.236.10.153",
                        "https://218.236.10.153")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // 허용할 HTTP 메서드
                .allowedHeaders("*")  // 모든 헤더 허용
                .exposedHeaders("access_token", "refresh_token", "Authorization")
                .allowCredentials(true)  // 쿠키, 인증 정보 포함 여부
                .maxAge(3600);  // 캐시 시간 (1시간)
    }
}
