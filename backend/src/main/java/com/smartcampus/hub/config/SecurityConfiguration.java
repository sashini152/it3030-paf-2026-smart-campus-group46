package com.smartcampus.hub.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(Customizer.withDefaults())
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/", "/error").permitAll()
						.requestMatchers("/api/auth/**").permitAll()
						.requestMatchers("/api/resources/**").permitAll()
						.requestMatchers("/api/bookings/**").permitAll()
						.requestMatchers("/api/notifications/**").permitAll()
						.requestMatchers("/api/auth/me").permitAll()
						.anyRequest().authenticated())
				.oauth2Login(oauth -> oauth
						.defaultSuccessUrl("http://localhost:5173/oauth-success", true))
				.logout(logout -> logout
						.logoutUrl("/logout")
						.logoutSuccessUrl("http://localhost:5173/login")
						.invalidateHttpSession(true)
						.clearAuthentication(true)
						.deleteCookies("JSESSIONID"));
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