package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

/**
 * DTO para enviar el comentario al Frontend
 */
data class DiarioComentarioDto(
    val id: Int,
    val texto: String,
    val autorNombre: String,
    val esAdmin: Boolean, // Para saber si pintar el fondo de color diferente
    val fecha: LocalDateTime
)

/**
 * DTO para recibir el texto del nuevo comentario desde el Frontend
 */
data class ComentarioCreateDto(
    val texto: String
)