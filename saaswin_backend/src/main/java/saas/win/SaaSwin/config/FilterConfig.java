package saas.win.SaaSwin.config;

import jakarta.servlet.Filter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import saas.win.SaaSwin.keycloak.filter.KeycloakFilter;
import saas.win.SaaSwin.keycloak.service.KeycloakIntrospectService;
import saas.win.SaaSwin.keycloak.service.KeycloakRefreshTokenService;

@Configuration
public class FilterConfig {

    @Autowired
    private KeycloakIntrospectService keycloakIntrospectService;

    @Autowired
    private KeycloakRefreshTokenService keycloakRefreshTokenService;

    @Bean
    public KeycloakFilter keycloakFilter() {
        return new KeycloakFilter(keycloakIntrospectService, keycloakRefreshTokenService);
    }

    @Bean
    public FilterRegistrationBean<Filter> keycloakFilterRegistration() {
        FilterRegistrationBean<Filter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(keycloakFilter());
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
