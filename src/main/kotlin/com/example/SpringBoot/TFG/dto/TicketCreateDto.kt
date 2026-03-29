package com.example.SpringBoot.TFG.dto

data class TicketCreateDto(
    val titulo: String,
    val descripcion: String?,
    val prioridad: String? = "MEDIA"
)