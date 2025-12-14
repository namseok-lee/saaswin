package saas.win.SaaSwin.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import saas.win.SaaSwin.keycloak.dto.*;
import saas.win.SaaSwin.keycloak.exception.KeycloakException;
import saas.win.SaaSwin.keycloak.service.KeycloakIntrospectService;
import saas.win.SaaSwin.keycloak.service.KeycloakRefreshTokenService;

@RequiredArgsConstructor
@Component
public class KeycloakTokenInterceptor implements HandlerInterceptor {

   private final KeycloakIntrospectService keycloakIntrospectService; // 토큰 검증
   private final KeycloakRefreshTokenService keycloakRefreshTokenService; // 토큰 재발급

   private static final String ACCESS_TOKEN_HEADER = "access_token";
   private static final String REFRESH_TOKEN_HEADER = "refresh_token";

   // ✅ 요청별로 토큰을 저장하기 위한 ThreadLocal 변수
   private static final ThreadLocal<String> newAccessToken = new ThreadLocal<>();
   private static final ThreadLocal<String> newRefreshToken = new ThreadLocal<>();

   @Override
   public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
       System.out.println("🔹 [Interceptor] preHandle 실행됨 - 메소드 : " + request.getMethod());
       System.out.println("신청된 URL : " + request.getRequestURL());
       // ✅ `POST` 요청일 때만 실행
       if (!"POST".equalsIgnoreCase(request.getMethod())) {
           return true; // `POST` 요청이 아니면 인터셉터를 통과
       }

       String accessToken = request.getHeader(ACCESS_TOKEN_HEADER);
       String realm = "WIN";
       String refreshToken = request.getHeader(REFRESH_TOKEN_HEADER);

       System.out.println("입력된22 AccessToken: " + accessToken);
       System.out.println("입력된22 RefreshToken: " + refreshToken);

//        if (accessToken == null || refreshToken == null) {
//            throw new KeycloakException("인증 토큰이 없습니다. 다시 로그인하세요.");
//        }

       try {
           // 🔹 Keycloak에 토큰 유효성 검사 요청
           KeycloakIntrospectRequestDto introspectRequest = new KeycloakIntrospectRequestDto(accessToken, realm);
           KeycloakIntrospectResponseDto introspectResponse = keycloakIntrospectService.introspectToken(introspectRequest);

           System.out.println("Active 상태: " + introspectResponse.getActive());

           if (!introspectResponse.getActive()) {
               // 🔹 액세스 토큰이 만료됨 → 리프레시 토큰을 사용하여 자동 갱신
               KeycloakRefreshTokenResponseDto newToken = keycloakRefreshTokenService.refreshToken(new KeycloakRefreshTokenRequestDto(refreshToken));
               System.out.println("새 토큰");
               System.out.println(newToken.getAccessToken());
               System.out.println(newToken.getRefreshToken());
               // 🔹 새 토큰을 요청별 ThreadLocal에 저장
               newAccessToken.set(newToken.getAccessToken());
               newRefreshToken.set(newToken.getRefreshToken());


           }

           System.out.println("✅ 토큰 검증 완료");
           return true;

       } catch (KeycloakException e) {
           response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
           response.getWriter().write("토큰이 만료되었습니다. 다시 로그인하세요.");
           return false;
       }
   }

   @Override
   public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
       String accessToken = newAccessToken.get();
       String refreshToken = newRefreshToken.get();

       if (accessToken != null && refreshToken != null) {
           response.setHeader("access_token", accessToken);  // ✅ 기존 값 덮어쓰기
           response.setHeader("refresh_token", refreshToken);
       }
   }

   @Override
   public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
       // ✅ 응답 헤더 출력
       response.getHeaderNames().forEach(header ->
               System.out.println("Response Header: " + header + " = " + response.getHeader(header))
       );

       // ✅ 응답 상태 코드 확인
       System.out.println("Response Status: " + response.getStatus());

       // ✅ 요청 완료 후 ThreadLocal 값 삭제 (메모리 누수 방지)
       newAccessToken.remove();
       newRefreshToken.remove();
   }
}
