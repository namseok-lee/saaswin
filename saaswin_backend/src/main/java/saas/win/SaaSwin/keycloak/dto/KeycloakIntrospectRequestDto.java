package saas.win.SaaSwin.keycloak.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakIntrospectRequestDto {
    private String token;

    private String realm;
//    private String clientId;
//    private String clientSecret;
}
