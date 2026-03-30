package com.example.SpringBoot.TFG.config

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType
import io.swagger.v3.oas.annotations.info.Contact
import io.swagger.v3.oas.annotations.info.Info
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.security.SecurityScheme
import org.springframework.context.annotation.Configuration

@Configuration
@OpenAPIDefinition(
    info = Info(
        title = "API Backend TFG",
        version = "1.0",
        description = "Documentación de la API REST para el Trabajo de Fin de Grado. " +
                "Incluye gestión de usuarios, proyectos, diarios, tickets y eventos.",
        contact = Contact(
            name = "TFG DAM",
            email = "admin@tfg-dam.com"
        )
    ),
    security = [SecurityRequirement(name = "bearerAuth")] // Aplica seguridad globalmente
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Pega aquí tu token de Firebase (sin la palabra Bearer)"
)
class OpenApiConfig