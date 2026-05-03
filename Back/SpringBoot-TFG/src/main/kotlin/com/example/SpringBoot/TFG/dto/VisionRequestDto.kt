package com.example.SpringBoot.TFG.dto

data class VisionRequestDto(
    val imageBase64: String,
    val mimeType: String = "image/jpeg"
)
