package saas.win.SaaSwin.keycloak.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import saas.win.SaaSwin.util.SHA512Util;

import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakUpdatePasswordRequestDto {

    @Schema(description = "Keycloak Realm")
    private String realm;

    @Schema(description = "사용자 이름")
    private String username;

    @Schema(description = "사용자 비밀번호 값")
    private String newPassword;

    @Schema(hidden = true) // Swagger에서 보이지 않도록 설정
    public List<Credentials> getCredentials() {
        return Collections.singletonList(new Credentials(SHA512Util.hashSHA512(newPassword)));
    }

    public String getRealm() {
        if (realm == null){
            return "WIN";
        }
        return realm;
    }

    /**
     * `type`은 `"password"`, `temporary`는 `false`로 고정된 Credentials 클래스
     */
    @Data
    public static class Credentials {
        private final String type = "password";
        private String value;
        private final boolean temporary = false;

        public Credentials(String value) {
            this.value = value;
        }
    }
}
