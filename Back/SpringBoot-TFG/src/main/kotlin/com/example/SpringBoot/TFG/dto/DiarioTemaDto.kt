package com.example.SpringBoot.TFG.dto

data class DiarioTemaDto(
    val id: Int,
    val titulo: String?,
    val descripcion: String?,
    val usuarioId: Int?,
    val visibilidad: String = "PRIVADO",
    val usuarioNombre: String? = null,
    val tituloPublicacion: String? = null,
    val descripcionPublicacion: String? = null
)

data class VisibilidadUpdateDto(
    val visibilidad: String,
    val tituloPublicacion: String? = null,
    val descripcionPublicacion: String? = null
)

data class DiarioTemaUpdateDto(val titulo: String?, val descripcion: String?)