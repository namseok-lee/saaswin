package saas.win.SaaSwin.keycloak.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import saas.win.SaaSwin.keycloak.dto.KeycloakIntrospectRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakIntrospectResponseDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakRefreshTokenRequestDto;
import saas.win.SaaSwin.keycloak.dto.KeycloakRefreshTokenResponseDto;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;
import saas.win.SaaSwin.keycloak.service.KeycloakIntrospectService;
import saas.win.SaaSwin.keycloak.service.KeycloakRefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component // 필터를 Spring의 컴포넌트로 등록하여 의존성 주입을 받을 수 있도록 합니다.
public class KeycloakFilter implements Filter {



    private static final String ACCESS_TOKEN_HEADER = "access_token";
    private static final String REFRESH_TOKEN_HEADER = "refresh_token";

    private final KeycloakIntrospectService keycloakIntrospectService;
    private final KeycloakRefreshTokenService keycloakRefreshTokenService;

    @Value("${front.url}")
    private String front_url;

    // 제외할 URL 경로들을 리스트로 관리
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/api/keycloak/register",   // 가입
            "/api/keycloak/token",      // 로그인
            "/api/keycloak/update-password", // 비밀번호 변경
            "/api/keycloak/introspect", // 토큰 검증
            "/api/language/ko.json", // 언어
            "/api/keycloak/logout"
    );

    // 생성자를 통해 의존성 주입
    @Autowired
    public KeycloakFilter(KeycloakIntrospectService keycloakIntrospectService,
                          KeycloakRefreshTokenService keycloakRefreshTokenService) {
        this.keycloakIntrospectService = keycloakIntrospectService;
        this.keycloakRefreshTokenService = keycloakRefreshTokenService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("🔹 토큰 검증 시작~~~~~~~~~~~~~~~~ 합니다22");
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // OPTIONS 요청이면 바로 통과 (CORS 관련)
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            System.out.println("🔹 OPTIONS 요청이면 바로 통과 (CORS 관련)");
            chain.doFilter(request, response); // 필터를 건너뛰고 요청을 처리
            return;
        }
        
        // 요청 경로 확인 (ex: /api/keycloak/register 등 제외할 URL)
        String requestURI = httpRequest.getRequestURI();
        
        if (EXCLUDED_PATHS.contains(requestURI)) {
            // 제외할 URL에 대해서는 필터 처리하지 않음
            chain.doFilter(request, response);
            return;
        }
        System.out.println("토큰 검증 ac, re22");
        String accessToken = httpRequest.getHeader("access_token"); // 헤더에서 access_token 받기
        String refreshToken = httpRequest.getHeader("refresh_token"); // 헤더에서 refresh_token 받기
        System.out.println("토큰 검증 " + accessToken + " " + refreshToken);
        try {
            if(accessToken != null && !accessToken.isEmpty()) {
                // 🔹 Keycloak에 토큰 유효성 검사 요청
                KeycloakIntrospectRequestDto introspectRequest = new KeycloakIntrospectRequestDto(accessToken, "WIN"); // realmName을 적절히 설정해야 합니다.

                KeycloakIntrospectResponseDto introsepctResonse = keycloakIntrospectService.introspectToken(introspectRequest);

                System.out.println("Active 상태: " + introsepctResonse.getActive());

                if (!introsepctResonse.getActive()) {
                    // 🔹 액세스 토큰이 만료됨 → 리프레시 토큰을 사용하여 자동 갱신
                    KeycloakRefreshTokenResponseDto newToken = keycloakRefreshTokenService.refreshToken(new KeycloakRefreshTokenRequestDto(refreshToken));
                    System.out.println("새 토큰: " + newToken.getAccessToken());
                    System.out.println("새 RefreshToken: " + newToken.getRefreshToken());

                    // 🔹 새 토큰을 헤더에 추가
                    httpResponse.setHeader(ACCESS_TOKEN_HEADER, newToken.getAccessToken());
                    httpResponse.setHeader(REFRESH_TOKEN_HEADER, newToken.getRefreshToken());
                }

                System.out.println("✅ 토큰 검증 완료222");
            } else {
                // 예외가 발생하면 Unauthorized 응답을 반환하고, 필터 체인 진행을 멈추고 응답을 반환
                System.out.println("accessToken을 찾을 수 없습니다 - 다시 로그인 하세요2.");
                // CORS 헤더 추가
                httpResponse.setHeader("Access-Control-Allow-Origin", front_url);
                httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                httpResponse.setHeader("Access-Control-Allow-Headers", "access_token, refresh_token, Content-Type");
                httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.setContentType("application/json;charset=UTF-8");
                httpResponse.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"accessToken을 찾을 수 없습니다 - 다시 로그인 하세요.\"}");
                httpResponse.getWriter().flush();
                return; // 필터 체인을 넘기지 않음
            }
            // 요청을 필터 체인에 전달
            chain.doFilter(request, response);

        } catch (KeycloakException e) {
            // 예외가 발생하면 Unauthorized 응답을 반환하고, 필터 체인 진행을 멈추고 응답을 반환
            // CORS 헤더 추가
            httpResponse.setHeader("Access-Control-Allow-Origin", front_url);
            httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            httpResponse.setHeader("Access-Control-Allow-Headers", "access_token, refresh_token, Content-Type");
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"토큰 검증 오류 - 다시 로그인 하세요.\"}");
            httpResponse.getWriter().flush();
            return; // 필터 체인을 넘기지 않음
        } catch (Exception e) {
            // 기타 예외 처리
            e.printStackTrace();
            throw new ServletException("필터 처리 중 오류 발생", e);
        }
    }
}
