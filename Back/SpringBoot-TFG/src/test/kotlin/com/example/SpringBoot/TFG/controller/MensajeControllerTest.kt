package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.MensajeCreateDto
import com.example.SpringBoot.TFG.dto.MensajeDto
import com.example.SpringBoot.TFG.service.MensajeService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

@WebMvcTest(MensajeController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
@MockBean(com.example.SpringBoot.TFG.repository.UsuarioRepository::class)
class MensajeControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var service: MensajeService

    private fun makeMensaje(id: Int, texto: String) = MensajeDto(
        id = id,
        texto = texto,
        autorId = 1,
        autorNombre = "Test User",
        autorFoto = null,
        fechaEnvio = LocalDateTime.now(),
        leido = false,
        esStaff = false
    )

    // ────────────────────────────────────────────────────────────────────
    // GET /api/mensajes/conversacion/{convId}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET deConversacion retorna 200 con mensajes de la conversacion`() {
        given(service.obtenerMensajes(1)).willReturn(listOf(makeMensaje(1, "Hola"), makeMensaje(2, "¿Cómo vas?")))

        mockMvc.perform(get("/api/mensajes/conversacion/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].texto").value("Hola"))
    }

    @Test
    fun `GET deConversacion retorna 200 con lista vacia`() {
        given(service.obtenerMensajes(5)).willReturn(emptyList())

        mockMvc.perform(get("/api/mensajes/conversacion/5"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isEmpty)
    }

    // ────────────────────────────────────────────────────────────────────
    // POST /api/mensajes
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST enviar retorna 200 con el mensaje enviado`() {
        val dto = MensajeCreateDto(conversacionId = 1, texto = "Hola mundo")
        given(service.enviarMensaje(dto)).willReturn(makeMensaje(3, "Hola mundo"))

        mockMvc.perform(
            post("/api/mensajes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.texto").value("Hola mundo"))
            .andExpect(jsonPath("$.id").value(3))
    }

    @Test
    fun `POST enviar llama al service con los datos correctos`() {
        val dto = MensajeCreateDto(conversacionId = 2, texto = "Mensaje importante")
        given(service.enviarMensaje(dto)).willReturn(makeMensaje(4, "Mensaje importante"))

        mockMvc.perform(
            post("/api/mensajes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isOk)

        verify(service).enviarMensaje(dto)
    }

    // ────────────────────────────────────────────────────────────────────
    // PUT /api/mensajes/leer-todo/{convId}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `PUT marcarComoLeido retorna 200`() {
        mockMvc.perform(put("/api/mensajes/leer-todo/1"))
            .andExpect(status().isOk)

        verify(service).marcarComoLeidos(1)
    }
}
