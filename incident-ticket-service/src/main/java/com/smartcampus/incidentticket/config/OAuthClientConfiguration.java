package com.smartcampus.incidentticket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;

@Configuration
public class OAuthClientConfiguration {

    @Bean
    @Conditional(GoogleOauthConfiguredCondition.class)
    public ClientRegistrationRepository clientRegistrationRepository(AppProperties appProperties) {
        ClientRegistration googleRegistration = CommonOAuth2Provider.GOOGLE
            .getBuilder("google")
            .clientId(appProperties.getOauth().getGoogle().getClientId())
            .clientSecret(appProperties.getOauth().getGoogle().getClientSecret())
            .scope("openid", "profile", "email")
            .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
            .build();

        return new InMemoryClientRegistrationRepository(googleRegistration);
    }

    @Bean
    @Conditional(GoogleOauthConfiguredCondition.class)
    public OAuth2AuthorizedClientService authorizedClientService(
        ClientRegistrationRepository clientRegistrationRepository
    ) {
        return new InMemoryOAuth2AuthorizedClientService(clientRegistrationRepository);
    }
}
