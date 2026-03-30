package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

data class TicketComentarioDto(
    val id: Int,
    val texto: String,
    val autorNombre: String,
    val esStaff: Boolean, // Para distinguir visualmente al administrador en el frontend
    val fechaEnvio: LocalDateTime
)

data class TicketComentarioCreateDto(
    val texto: String
)