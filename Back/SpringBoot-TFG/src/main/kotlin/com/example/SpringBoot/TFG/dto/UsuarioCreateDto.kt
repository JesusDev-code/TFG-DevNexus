package com.example.SpringBoot.TFG.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class UsuarioCreateDto(
    @field:Email(message = "Formato de email inválido")
    @field:NotBlank(message = "El email es obligatorio")
    val email: String,

    @field:NotBlank(message = "El nombre es obligatorio")
    @field:Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    val nombre: String,

    @field:Size(max = 500, message = "La biografía no puede exceder 500 caracteres")
    val biografia: String? = null,

    @field:Size(max = 500, message = "La foto de perfil no puede exceder 500 caracteres")
    val foto_perfil: String? = null,

    @field:NotNull(message = "Rol ID es obligatorio")
    @field:Positive(message = "El ID del rol debe ser un número positivo")
    val rolId: Int,

    @field:Positive(message = "El ID del departamento debe ser positivo")
    val departamentoId: Int? = null,

    @JsonProperty("fcm_token")
    val fcmToken: String?
)