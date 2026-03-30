package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

data class DiarioDto(
    val id: Int,
    val contenido: String?,
    val visibilidad: String,
    val fechaCreacion: LocalDateTime,
    val usuarioId: Int,
    val usuarioNombre: String,
    val temaTitulo: String?
)