package com.example.SpringBoot.TFG.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class UsuarioUpdateDto(
    val nombre: String?,
    val biografia: String?,
    val foto_perfil: String?,
    val permiteContacto: Boolean?,
    val motivoNoContacto: String?,
    val departamentoId: Int?,
    val rolId: Int?,

    @JsonProperty("fcm_token")
    val fcmToken: String?
)