package saas.win.SaaSwin.keycloak.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakRefreshTokenRequestDto {
    private String refreshToken;
}
