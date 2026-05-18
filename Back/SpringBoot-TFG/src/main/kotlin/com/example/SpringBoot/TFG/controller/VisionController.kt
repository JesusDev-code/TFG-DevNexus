package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.VisionRequestDto
import com.example.SpringBoot.TFG.dto.VisionResponseDto
import com.example.SpringBoot.TFG.service.VisionService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/vision")
class VisionController(
    private val visionService: VisionService
) {
    @PostMapping("/extraer-codigo")
    fun extraerCodigo(@Valid @RequestBody request: VisionRequestDto): VisionResponseDto {
        val texto = visionService.extraerCodigo(request.imageBase64, request.mimeType)
        return VisionResponseDto(texto = texto)
    }
}
