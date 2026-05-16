package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.NotificacionDto
import com.example.SpringBoot.TFG.service.NotificacionService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

@WebMvcTest(NotificacionController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
@MockBean(com.example.SpringBoot.TFG.repository.UsuarioRepository::class)
class NotificacionControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var service: NotificacionService

    private fun makeNotifDto(id: Int, msg: String, leida: Boolean = false) = NotificacionDto(
        id = id,
        mensaje = msg,
        fecha = LocalDateTime.now(),
        leida = leida
    )

    // ────────────────────────────────────────────────────────────────────
    // GET /api/notificaciones
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET list retorna 200 con notificaciones del usuario`() {
        given(service.listarMisNotificaciones()).willReturn(
            listOf(makeNotifDto(1, "Tienes un nuevo ticket"), makeNotifDto(2, "Evento próximo"))
        )

        mockMvc.perform(get("/api/notificaciones"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].mensaje").value("Tienes un nuevo ticket"))
    }

    @Test
    fun `GET list retorna 200 con lista vacia`() {
        given(service.listarMisNotificaciones()).willReturn(emptyList())

        mockMvc.perform(get("/api/notificaciones"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isEmpty)
    }

    // ────────────────────────────────────────────────────────────────────
    // PATCH /api/notificaciones/{id}/leer
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `PATCH marcarLeida retorna 200 con notificacion marcada como leida`() {
        given(service.marcarLeida(1)).willReturn(makeNotifDto(1, "Hola", leida = true))

        mockMvc.perform(patch("/api/notificaciones/1/leer"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.leida").value(true))
            .andExpect(jsonPath("$.id").value(1))
    }

    @Test
    fun `PATCH marcarLeida llama al service con el id correcto`() {
        given(service.marcarLeida(5)).willReturn(makeNotifDto(5, "Mensaje", leida = true))

        mockMvc.perform(patch("/api/notificaciones/5/leer"))
            .andExpect(status().isOk)

        verify(service).marcarLeida(5)
    }

    // ────────────────────────────────────────────────────────────────────
    // PATCH /api/notificaciones/leer-todas
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `PATCH marcarTodas retorna 204`() {
        mockMvc.perform(patch("/api/notificaciones/leer-todas"))
            .andExpect(status().isNoContent)

        verify(service).marcarTodasLeidas()
    }

    // ────────────────────────────────────────────────────────────────────
    // DELETE /api/notificaciones/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `DELETE retorna 204 cuando la notificacion se elimina`() {
        mockMvc.perform(delete("/api/notificaciones/1"))
            .andExpect(status().isNoContent)

        verify(service).eliminar(1)
    }
}
