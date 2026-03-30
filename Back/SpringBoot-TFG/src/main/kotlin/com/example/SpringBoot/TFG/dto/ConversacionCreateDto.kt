package com.example.SpringBoot.TFG.dto

/**
 * DTO para la creación de una nueva conversación.
 * Solo pedimos lo estrictamente necesario al frontend.
 */
data class ConversacionCreateDto(
    val titulo: String?,
    val tipo: String, // Debe ser "individual" o "grupal"
    val invitadoId: Int?
)