package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

data class TicketHistoricoDto(
    val id: Int?,
    val estadoAnterior: String?,
    val estadoNuevo: String,
    val usuarioNombre: String,
    val comentario: String?,
    val fecha: LocalDateTime
)