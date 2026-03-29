package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

data class TicketDto(
    val id: Int,
    val codigo: String,
    val titulo: String,
    val descripcion: String?,
    val estado: String,
    val prioridad: String,
    val fechaCreacion: LocalDateTime,
    val usuarioNombre: String?
)