package com.example.SpringBoot.TFG.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.server.ResponseStatusException

@Service
class VisionService(
    private val restTemplate: RestTemplate,
    @Value("\${groq.api-key}") private val groqApiKey: String
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val groqUrl = "https://api.groq.com/openai/v1/chat/completions"
    private val model = "meta-llama/llama-4-scout-17b-16e-instruct"

    fun extraerCodigo(imageBase64: String, mimeType: String): String {
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            setBearerAuth(groqApiKey)
        }

        val body = mapOf(
            "model" to model,
            "max_tokens" to 4096,
            "messages" to listOf(
                mapOf(
                    "role" to "user",
                    "content" to listOf(
                        mapOf(
                            "type" to "text",
                            "text" to "Extrae ÚNICAMENTE el código que aparece en la imagen. Devuelve solo el código en texto plano, sin bloques markdown, sin explicaciones. Preserva exactamente la indentación y el formato."
                        ),
                        mapOf(
                            "type" to "image_url",
                            "image_url" to mapOf(
                                "url" to "data:$mimeType;base64,$imageBase64"
                            )
                        )
                    )
                )
            )
        )

        return try {
            val response = restTemplate.postForObject(
                groqUrl,
                HttpEntity(body, headers),
                Map::class.java
            ) ?: throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Groq no respondió")

            @Suppress("UNCHECKED_CAST")
            val choices = response["choices"] as? List<Map<String, Any>>
            val message = choices?.firstOrNull()?.get("message") as? Map<*, *>
            val content = message?.get("content") as? String

            content?.trim() ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Respuesta vacía de Groq")
        } catch (ex: ResponseStatusException) {
            throw ex
        } catch (ex: Exception) {
            logger.error("Error llamando a Groq Vision API: ${ex.message}", ex)
            throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Error al contactar con el servicio de IA")
        }
    }
}
