package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.EventoCreateDto
import com.example.SpringBoot.TFG.dto.EventoDto
import com.example.SpringBoot.TFG.dto.UsuarioResumenDto
import com.example.SpringBoot.TFG.model.EventoVisibilidad
import com.example.SpringBoot.TFG.service.EventoService
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
import java.time.LocalDate
import java.time.LocalTime

@WebMvcTest(EventoController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
@MockBean(com.example.SpringBoot.TFG.repository.UsuarioRepository::class)
class EventoControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var service: EventoService

    private fun makeEvento(id: Int, titulo: String, visibilidad: EventoVisibilidad = EventoVisibilidad.PUBLICO) = EventoDto(
        id = id,
        titulo = titulo,
        descripcion = "Descripción",
        fechaEvento = LocalDate.of(2025, 6, 15),
        horaEvento = LocalTime.of(10, 0),
        visibilidad = visibilidad,
        usuario = UsuarioResumenDto(1, "Test User")
    )

    // ────────────────────────────────────────────────────────────────────
    // GET /api/eventos
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET list retorna 200 con lista de eventos`() {
        given(service.listarSeguro()).willReturn(
            listOf(
                makeEvento(1, "Hackathon"),
                makeEvento(2, "Presentación", EventoVisibilidad.PRIVADO)
            )
        )

        mockMvc.perform(get("/api/eventos"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].titulo").value("Hackathon"))
    }

    @Test
    fun `GET list retorna 200 con lista vacia`() {
        given(service.listarSeguro()).willReturn(emptyList())

        mockMvc.perform(get("/api/eventos"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isEmpty)
    }

    // ────────────────────────────────────────────────────────────────────
    // POST /api/eventos
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST crear retorna 201 con el evento creado`() {
        val dto = EventoCreateDto(
            titulo = "Nuevo Evento",
            descripcion = "Detalle",
            fechaEvento = LocalDate.of(2025, 7, 1),
            horaEvento = LocalTime.of(9, 0),
            visibilidad = EventoVisibilidad.PUBLICO
        )
        given(service.crearEventoSeguro(dto)).willReturn(makeEvento(3, "Nuevo Evento"))

        mockMvc.perform(
            post("/api/eventos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.titulo").value("Nuevo Evento"))
            .andExpect(jsonPath("$.id").value(3))
    }

    @Test
    fun `POST crear llama al service con los datos correctos`() {
        val dto = EventoCreateDto(
            titulo = "Evento Test",
            descripcion = null,
            fechaEvento = LocalDate.now(),
            horaEvento = LocalTime.NOON,
            visibilidad = EventoVisibilidad.PRIVADO
        )
        given(service.crearEventoSeguro(dto)).willReturn(makeEvento(4, "Evento Test", EventoVisibilidad.PRIVADO))

        mockMvc.perform(
            post("/api/eventos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isCreated)

        verify(service).crearEventoSeguro(dto)
    }

    // ────────────────────────────────────────────────────────────────────
    // DELETE /api/eventos/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `DELETE retorna 204 cuando el evento se elimina`() {
        mockMvc.perform(delete("/api/eventos/1"))
            .andExpect(status().isNoContent)

        verify(service).eliminarEventoSeguro(1)
    }
}
