package com.campus.resource_system;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the publicly-hosted React frontend (Vercel) to call this API.
 *
 * Set the FRONTEND_URL environment variable in your Render dashboard to
 * your Vercel URL, e.g.:  https://campus-ui-xyz.vercel.app
 *
 * During local development it defaults to http://localhost:5173
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed.origin:http://localhost:5173}")
    private String allowedOrigin;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(allowedOrigin)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false);
            }
        };
    }
}
