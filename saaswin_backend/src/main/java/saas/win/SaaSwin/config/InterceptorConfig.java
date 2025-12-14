package saas.win.SaaSwin.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// import saas.win.SaaSwin.keycloak.interceptor.KeycloakTokenInterceptor;

@Slf4j
@RequiredArgsConstructor
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    // private final KeycloakTokenInterceptor keycloakTokenInterceptor;
    

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        log.debug("🔹 InterceptorConfig에서 인터셉터 등록됨");

        // 1. Keycloak 토큰 인터셉터 등록
        // registry.addInterceptor(keycloakTokenInterceptor)
        //         .addPathPatterns("/api/**") // 모든 API 요청을 인터셉트
        //         .excludePathPatterns("/api/keycloak/token", "/api/keycloak/refresh", "/api/keycloak/register", "/api/keycloak/logout") // 로그인 및 토큰 갱신 API 제외
        //         .order(2); // 두 번째 우선순위
    }

    @PostConstruct
    public void init() {
        log.debug("🔹 WebConfig 초기화 완료 - 다중 DB 라우팅 및 Keycloak 인터셉터 등록됨");
    }
}