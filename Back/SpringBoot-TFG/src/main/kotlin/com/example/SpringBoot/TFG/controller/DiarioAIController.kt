package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.service.DiarioAIService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/diario-ai")
class DiarioAIController(private val service: DiarioAIService) {

    @PostMapping("/code-review/{diarioId}")
    fun codeReview(@PathVariable diarioId: Int): Map<String, String> =
        mapOf("review" to service.codeReview(diarioId))

    @PostMapping("/sugerir-etiquetas")
    fun sugerirEtiquetas(@RequestBody body: Map<String, String>): Map<String, Any> {
        val contenido = body["contenido"] ?: ""
        return mapOf("etiquetas" to service.sugerirEtiquetas(contenido))
    }

    @PostMapping("/resumir-tema/{temaId}")
    fun resumirTema(@PathVariable temaId: Int): Map<String, String> =
        mapOf("resumen" to service.resumirTema(temaId))
}
