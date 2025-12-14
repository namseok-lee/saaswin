// package saas.win.SaaSwin.config;

// import jakarta.annotation.PostConstruct;
// import lombok.RequiredArgsConstructor;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// import saas.win.SaaSwin.keycloak.interceptor.KeycloakTokenInterceptor;

// @RequiredArgsConstructor
// @Configuration
// public class WebConfig implements WebMvcConfigurer {

//    private final KeycloakTokenInterceptor keycloakTokenInterceptor;

//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        System.out.println("🔹 WebConfig에서 인터셉터 등록됨");

//        registry.addInterceptor(keycloakTokenInterceptor)
//                .addPathPatterns("/api/**") // 🔹 모든 API 요청을 인터셉트
//                .excludePathPatterns("/api/keycloak/token", "/api/keycloak/refresh", "/api/keycloak/register", "/api/keycloak/logout"); // 🔹 로그인 및 토큰 갱신 API 제외
//    }

// }