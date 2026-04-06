package com.smartcampus.hub.config;

import com.smartcampus.hub.auth.SimpleOAuth2SuccessHandler;
import java.util.List;

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

	public SecurityConfiguration(SimpleOAuth2SuccessHandler simpleOAuth2SuccessHandler) {
		this.simpleOAuth2SuccessHandler = simpleOAuth2SuccessHandler;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(Customizer.withDefaults())
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/public/**",
								"/api/test/**", "/api/auth/**")
						.permitAll()
						.requestMatchers("/api/**").permitAll()
						.anyRequest().permitAll())
				.oauth2Login(oauth2 -> oauth2
						.successHandler(simpleOAuth2SuccessHandler)
						.permitAll());
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of(
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"https://accounts.google.com",
				"https://*.googleusercontent.com"));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}
