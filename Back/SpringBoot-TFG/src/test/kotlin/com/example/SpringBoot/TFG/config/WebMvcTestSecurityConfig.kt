package com.example.SpringBoot.TFG.config

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain

/**
 * Configuración de seguridad mínima para tests de controladores (@WebMvcTest).
 * Deshabilita CSRF y permite todas las peticiones sin pasar por el FirebaseAuthFilter.
 * Se activa solo con el perfil "test".
 */
@TestConfiguration
@Profile("test")
class WebMvcTestSecurityConfig {

    @Bean
    fun testSecurityFilterChain(http: HttpSecurity): SecurityFilterChain =
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { it.anyRequest().permitAll() }
            .build()
}
