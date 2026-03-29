package com.example.SpringBoot.TFG.dto

data class InvitarUsuarioDto(
    val email: String // Invitamos por email
)

data class InvitacionPendienteDto(
    val id: Long,
    val temaTitulo: String,
    val ownerNombre: String,
    val fecha: String
)