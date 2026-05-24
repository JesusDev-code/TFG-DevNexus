package com.example.SpringBoot.TFG.dto

data class UsuarioDto(
    val id: Int,
    val nombre: String,
    val biografia: String?,
    val foto_perfil: String?,
    val email: String,
    val rolNombre: String,
    val departamentoNombre: String?,
    val departamentoId: Int?,
    val permiteContacto: Boolean,
    val motivoNoContacto: String?
)
