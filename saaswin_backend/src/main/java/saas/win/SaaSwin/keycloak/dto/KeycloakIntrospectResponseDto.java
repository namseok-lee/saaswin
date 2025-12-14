package saas.win.SaaSwin.keycloak.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class KeycloakIntrospectResponseDto {

    private Long exp;  // 토큰 만료 시간 (Unix Timestamp)
    private Long iat;  // 토큰 발급 시간 (Unix Timestamp)
    private String jti;  // 토큰 ID
    private String iss;  // 토큰 발급자 (Issuer)
//    private List<String> aud;  // Audience (허용된 서비스)
    private String sub;  // 사용자 ID (Subject)
    private String typ;  // 토큰 타입 (예: Bearer)
    private String azp;  // Authorized Party (인증된 클라이언트 ID)
    private String sid;  // 세션 ID
    private String acr;  // 인증 수준 (Authentication Context Class Reference)

//    @JsonProperty("allowed-origins")
//    private List<String> allowedOrigins;  // 허용된 오리진(Origin) 목록

//    @JsonProperty("realm_access")
//    private RealmAccess realmAccess;  // Realm 역할 정보

//    @JsonProperty("resource_access")
//    private Map<String, ResourceAccess> resourceAccess;  // 리소스별 접근 권한 정보

    private String scope;  // 허용된 OAuth2 스코프
    private Boolean emailVerified;  // 이메일 검증 여부
    private String name;  // 전체 이름
    private String preferredUsername;  // 기본 사용자 이름
    private String givenName;  // 이름
    private String locale;  // 사용자 언어
    private String familyName;  // 성
    private String email;  // 이메일
    private String clientId;  // 클라이언트 ID
    private String username;  // 사용자명
    private String tokenType;  // 토큰 타입 (예: Bearer)
    private Boolean active;  // 토큰 활성 여부

    // ====== 내부 클래스 (Realm 역할) ======
//    @Getter
//    @Setter
//    public static class RealmAccess {
//        private List<String> roles;
//    }

    // ====== 내부 클래스 (리소스 접근 정보) ======
//    @Getter
//    @Setter
//    public static class ResourceAccess {
//        private List<String> roles;
//    }
}
