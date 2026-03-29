package com.example.SpringBoot.TFG.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class DiarioTemaCreateDto(
    @field:NotBlank(message = "El título del tema no puede estar vacío")
    @field:Size(max = 100, message = "El título no puede exceder los 100 caracteres")
    val titulo: String,
    val descripcion: String?
)