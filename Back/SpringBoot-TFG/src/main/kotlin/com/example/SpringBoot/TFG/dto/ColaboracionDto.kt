package com.example.SpringBoot.TFG.dto

data class InvitarUsuarioDto(
    val email: String
)

data class InvitacionPendienteDto(
    val id: Long,
    val temaTitulo: String,
    val ownerNombre: String,
    val fecha: String
)

data class ColaboradorDto(
    val id: Int,
    val nombre: String,
    val foto_perfil: String?
)