package com.example.SpringBoot.TFG.dto

import com.example.SpringBoot.TFG.model.Plataforma

data class FcmTokenRegistroDto(
    val token: String,
    val plataforma: Plataforma
)
