package saas.win.SaaSwin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${server.file}")
    private boolean isFileServer;

    @Value("${spring.profiles.active}")
    private String activeEnv;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        if ("local".equals(activeEnv) || "dev".equals(activeEnv)) {
            http
                    .authorizeHttpRequests(auth -> auth
                            //.requestMatchers("/api/file/**").denyAll() // 파일controller 경로 비허용
                            //.anyRequest().authenticated() // 그 외 모든 요청 인증 필요
                            .anyRequest().permitAll() // 그 외의 모든 경로는 접근 허용
                    );
        }
        else {
            // 파일서버의 경우
            if (isFileServer) {
                http
                        .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/api/file/**").permitAll() // 파일controller 경로 허용
                                //.requestMatchers("/api/efs/**").permitAll()
                                //.anyRequest().authenticated() // 그 외 모든 요청 인증 필요
                                .anyRequest().denyAll() // 그 외의 모든 경로는 접근 비허용
                        );
            }
            // api 서버의 경우
            else {
                http
                        .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/api/file/**").denyAll() // 파일controller 경로 비허용
                                //.requestMatchers("/api/efs/**").denyAll()
                                //.anyRequest().authenticated() // 그 외 모든 요청 인증 필요
                                .anyRequest().permitAll() // 그 외의 모든 경로는 접근 허용
                        );
            }
        }

        // 폼 로그인 설정
        http.formLogin(form -> form
                        .disable()
                //.loginPage("/login") // 사용자 정의 로그인 페이지 설정
                //.permitAll() // 로그인 페이지 모두 접근 가능
            )
            // 로그아웃 설정
            .logout(logout -> logout
                    .disable()
                //.logoutUrl("/logout")
                //.permitAll()
            )
            // CSRF 설정
            .csrf(csrf -> csrf
                .disable() // 필요시 CSRF 비활성화
            );

        return http.build();
    }
}
