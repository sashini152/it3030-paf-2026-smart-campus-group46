package com.smartcampus.hub.config;

import com.smartcampus.hub.auth.SimpleOAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

        private final SimpleOAuth2SuccessHandler simpleOAuth2SuccessHandler;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/public/**",
                                                                "/api/test/**", "/api/admin/**", "/api/auth/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers("/api/resources", "/api/bookings/**", "/api/sample/**")
                                                .authenticated()
                                                .requestMatchers("/api/**").authenticated()
                                                .anyRequest().permitAll())
                                .oauth2Login(oauth2 -> oauth2.successHandler(simpleOAuth2SuccessHandler)
                                                .defaultSuccessUrl("http://localhost:5173/dashboard", true));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Allow all origins and headers for development
                config.setAllowCredentials(true); // Required for OAuth2/session
                config.addAllowedOrigin("http://localhost:5173"); // Specific origin, not *
                config.addAllowedHeader("*");
                config.addAllowedMethod("*");
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
