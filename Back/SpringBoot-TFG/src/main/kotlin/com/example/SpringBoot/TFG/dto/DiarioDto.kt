package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime
import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.ALWAYS)
data class DiarioDto(
    val id: Int,
    val contenido: String?,
    val visibilidad: String,
    val fechaCreacion: LocalDateTime,
    val usuarioId: Int,
    val usuarioNombre: String,
    val temaId: Int?,
    val temaTitulo: String?,
    val tipo: String? = null,
    val filename: String? = null
)

// DTO ligero para listar archivos sin contenido (evita problemas de serialización)
@JsonInclude(JsonInclude.Include.ALWAYS)
data class DiarioFileDto(
    val id: Int,
    val filename: String?,
    val tipo: String?,
    val fechaCreacion: LocalDateTime
)