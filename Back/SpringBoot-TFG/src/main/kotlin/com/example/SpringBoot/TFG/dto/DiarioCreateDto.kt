package com.example.SpringBoot.TFG.dto

import com.example.SpringBoot.TFG.model.Visibilidad
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class DiarioCreateDto(
    @field:NotBlank(message = "El contenido no puede estar vacío")
    @field:Size(max = 5000, message = "El contenido no puede exceder 5000 caracteres")
    val contenido: String,

    val visibilidad: Visibilidad,

    @field:Positive(message = "El ID del tema debe ser positivo")
    val temaId: Int? = null
)