package com.example.SpringBoot.TFG.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class VisionRequestDto(
    @field:NotBlank(message = "La imagen no puede estar vacía")
    @field:Size(max = 6_971_392, message = "La imagen no puede superar 5 MB")
    val imageBase64: String,

    @field:Pattern(
        regexp = "^image/(jpeg|png|gif|webp)$",
        message = "Tipo de imagen no permitido"
    )
    val mimeType: String = "image/jpeg"
)
