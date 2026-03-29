package com.example.SpringBoot.TFG.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class UsuarioDto(
    val id: Int,
    val nombre: String,
    val biografia: String?,
    val foto_perfil: String?,
    val email: String,
    val rolNombre: String,
    val departamentoNombre: String?,
    val departamentoId: Int?,

    @JsonProperty("fcm_token")
    val fcmToken: String?,
    // ✅ Campos de privacidad
    val permiteContacto: Boolean,
    val motivoNoContacto: String? // El controlador decidirá si enviarlo o no según el rol
)