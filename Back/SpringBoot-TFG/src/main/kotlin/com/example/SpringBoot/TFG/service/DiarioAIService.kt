package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.repository.DiarioRepository
import com.example.SpringBoot.TFG.repository.DiarioTemaRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
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
class DiarioAIService(
    private val restTemplate: RestTemplate,
    private val diarioRepo: DiarioRepository,
    private val diarioTemaRepo: DiarioTemaRepository,
    private val securityService: SecurityService,
    @Value("\${groq.api-key}") private val groqApiKey: String
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val groqUrl = "https://api.groq.com/openai/v1/chat/completions"
    private val model = "llama-3.3-70b-versatile"
    private val mapper = jacksonObjectMapper()

    fun codeReview(diarioId: Int): String {
        val diario = diarioRepo.findById(diarioId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Entrada no encontrada") }

        val contenido = diario.contenido?.trim()
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "La entrada no tiene contenido")

        return llamarGroq(
            system = """Eres un senior developer con 15 años de experiencia revisando código.
Analiza el siguiente contenido de un diario de desarrollo (formato Markdown).
Busca bloques de código y proporciona feedback técnico concreto sobre:
- Calidad y legibilidad del código
- Posibles bugs o problemas
- Mejoras y buenas prácticas aplicables
- Patrones o antipatrones detectados
Si no hay código explícito, analiza el enfoque técnico descrito.
Responde en español, de forma estructurada con secciones claras. Sé constructivo y directo.""",
            user = contenido
        )
    }

    fun sugerirEtiquetas(contenido: String): List<String> {
        if (contenido.isBlank()) return emptyList()

        val respuesta = llamarGroq(
            system = """Analiza el siguiente texto de una entrada de diario de un desarrollador.
Responde ÚNICAMENTE con un array JSON de 3 a 5 etiquetas cortas y relevantes en español o inglés técnico.
Sin texto adicional, sin markdown, solo el array. Ejemplo: ["kotlin","api-rest","refactor"]""",
            user = contenido.take(2000)
        )

        return try {
            mapper.readValue<List<String>>(respuesta.trim())
        } catch (e: Exception) {
            val cleaned = respuesta.substringAfter("[").substringBefore("]")
            cleaned.split(",").map { it.trim().removeSurrounding("\"") }.filter { it.isNotBlank() }
        }
    }

    fun resumirTema(temaId: Int): String {
        val tema = diarioTemaRepo.findById(temaId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }

        val principal = securityService.getUserPrincipal()
        val entradas = if (securityService.hasRole("ADMIN", "STAFF")) {
            diarioRepo.findAllByTemaIdOrderByFechaCreacionDesc(temaId)
        } else {
            val userId = principal.userId ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
            diarioRepo.findPermitidosByTemaId(userId, temaId)
        }

        if (entradas.isEmpty()) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "El tema no tiene entradas")

        val contenidoUnificado = entradas.takeLast(30).joinToString("\n\n---\n\n") { entrada ->
            "Fecha: ${entrada.fechaCreacion}\n${entrada.contenido ?: ""}"
        }.take(8000)

        return llamarGroq(
            system = """Eres un asistente técnico experto en desarrollo de software.
Analiza las siguientes entradas del diario de un proyecto de desarrollo llamado "${tema.titulo}".
Genera un resumen ejecutivo estructurado que incluya:
1. **Estado general del proyecto** — progreso percibido y madurez técnica
2. **Tecnologías y patrones usados** — stack detectado en las entradas
3. **Hitos y logros** — qué se ha conseguido
4. **Problemas y soluciones** — bugs reportados y cómo se resolvieron
5. **Próximos pasos sugeridos** — basados en el contenido del diario
Responde en español con formato Markdown claro y conciso.""",
            user = contenidoUnificado
        )
    }

    fun analizarProyecto(temaId: Int): Map<String, Any> {
        val tema = diarioTemaRepo.findById(temaId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }

        val archivos = diarioRepo.findAllByTemaIdAndTipoOrderByFechaCreacionDesc(temaId, "FILE")
            .groupBy { it.filename }
            .mapNotNull { (_, versions) -> versions.firstOrNull() }

        if (archivos.isEmpty())
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "El proyecto no tiene archivos de código aún")

        val codigoUnificado = archivos.joinToString("\n\n") { archivo ->
            "### ${archivo.filename}\n```\n${archivo.contenido ?: ""}\n```"
        }.take(10000)

        val respuesta = llamarGroq(
            system = """Eres un senior developer revisando un proyecto web llamado "${tema.titulo}".
Analiza los archivos de código del proyecto (HTML, CSS, JavaScript).
Responde ÚNICAMENTE con este JSON (sin markdown ni texto adicional):
{"feedback":"análisis en markdown","score":85,"sugerencias":["sugerencia"],"errores":["error"]}
El score es de 0 a 100. Si no hay errores, el array errores debe ser vacío.""",
            user = codigoUnificado
        )

        return try {
            @Suppress("UNCHECKED_CAST")
            mapper.readValue<Map<String, Any>>(respuesta.trim())
        } catch (e: Exception) {
            mapOf(
                "feedback" to respuesta,
                "score" to 0,
                "sugerencias" to emptyList<String>(),
                "errores" to emptyList<String>()
            )
        }
    }

    private fun llamarGroq(system: String, user: String): String {
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            setBearerAuth(groqApiKey)
        }

        val body = mapOf(
            "model" to model,
            "max_tokens" to 2048,
            "messages" to listOf(
                mapOf("role" to "system", "content" to system),
                mapOf("role" to "user", "content" to user)
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
            logger.error("Error llamando a Groq: ${ex.message}", ex)
            throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Error al contactar con el servicio de IA")
        }
    }
}
