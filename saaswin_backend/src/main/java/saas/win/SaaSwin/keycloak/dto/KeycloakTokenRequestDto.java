package saas.win.SaaSwin.keycloak.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakTokenRequestDto {
//    private String clientId;
//    private String clientSecret;
    private String username;
    private String password;
    private String realm;

    public String getRealm() {
        if (realm == null){
            return "WIN";
        }
        return realm;
    }
//    private String grantType;
}
