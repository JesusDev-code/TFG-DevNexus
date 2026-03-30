package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

data class MensajeDto(
    val id: Int,
    val texto: String,
    val autorId: Int,
    val autorNombre: String,
    val autorFoto: String?,
    val fechaEnvio: LocalDateTime,
    val leido: Boolean,
    val esStaff: Boolean
)

data class MensajeCreateDto(
    val conversacionId: Int,
    val texto: String
)