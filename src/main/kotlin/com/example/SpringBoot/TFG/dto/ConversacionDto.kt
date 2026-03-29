package com.example.SpringBoot.TFG.dto

import java.time.LocalDateTime

data class ConversacionDto(
    val id: Int,
    val titulo: String?,
    val tipo: String, // "individual" o "grupal"
    val ultimoMensaje: String?,
    val fechaUltimoMensaje: LocalDateTime?,
    val unreadCount: Long = 0,
    val avatarUrl: String?,
    val esAdmin: Boolean
)