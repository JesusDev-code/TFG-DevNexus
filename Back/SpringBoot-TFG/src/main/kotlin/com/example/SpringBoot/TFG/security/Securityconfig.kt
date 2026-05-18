package com.example.SpringBoot.TFG.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val firebaseAuthFilter: FirebaseAuthFilter,
    private val aiRateLimitFilter: AiRateLimitFilter
) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain =
        http
            // ✅ 1. Activamos CORS integrado en Seguridad
            .cors { it.configurationSource(corsConfigurationSource()) }

            .csrf { it.disable() }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authorizeHttpRequests {
                it
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Por seguridad extra
                    .requestMatchers("/h2-console/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/usuarios/registro").permitAll()
                    .requestMatchers("/favicon.ico").permitAll()

                    // Endpoints protegidos explícitamente (aunque se recomienda mover a @PreAuthorize)
                    .requestMatchers(HttpMethod.GET, "/api/usuarios/perfil").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/usuarios/perfil").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/usuarios/perfil").authenticated()

                    .requestMatchers(HttpMethod.GET, "/api/roles/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/roles/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/roles/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/departamentos/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/departamentos/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")

                    .requestMatchers(HttpMethod.PUT, "/api/diarios/*/revisar").hasAnyRole("STAFF", "ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/proyectos/*/validar").hasAnyRole("STAFF", "ADMIN")

                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/actuator/**").hasRole("ADMIN")

                    .anyRequest().authenticated()
            }
            .headers { headers ->
                headers.contentTypeOptions { }
                headers.frameOptions { frame -> frame.sameOrigin() }
                headers.contentSecurityPolicy { csp ->
                    csp.policyDirectives("frame-ancestors 'self';")
                }
                headers.httpStrictTransportSecurity { hsts ->
                    hsts.includeSubDomains(true).maxAgeInSeconds(31536000)
                }
            }
            .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
            .addFilterAfter(aiRateLimitFilter, FirebaseAuthFilter::class.java)
            .exceptionHandling {
                it.authenticationEntryPoint { _, response, authException ->
                    response.status = 401
                    response.contentType = "application/json"
                    response.writer.write("""{"error":"Unauthorized","message":"Autenticación requerida"}""")
                }
                it.accessDeniedHandler { _, response, _ ->
                    response.status = 403
                    response.contentType = "application/json"
                    response.writer.write("""{"error":"Forbidden","message":"Acceso denegado"}""")
                }
            }
            .build()

    // ✅ 2. Definimos la fuente de configuración CORS aquí mismo
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()

        configuration.allowedOrigins = listOf(
            "http://localhost:4200",      // Web Local (Angular)
            "http://localhost:8100",      // Web Local (Ionic)
            "https://localhost",          // 📱 ESTO ES ANDROID (Capacitor)
            "capacitor://localhost",      // 📱 ESTO ES iOS
            "https://devnexus.es" // Tu dominio en Render (por si acaso)
        )

        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}