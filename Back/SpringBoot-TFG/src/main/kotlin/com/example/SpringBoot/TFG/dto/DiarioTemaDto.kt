package com.example.SpringBoot.TFG.dto

data class DiarioTemaDto(
    val id: Int,
    val titulo: String?,
    val descripcion: String?,
    val usuarioId: Int?
)