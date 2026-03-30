package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

data class NotificacionDto(
    val id: Int,
    val mensaje: String,
    val fecha: LocalDateTime,
    val leida: Boolean
)