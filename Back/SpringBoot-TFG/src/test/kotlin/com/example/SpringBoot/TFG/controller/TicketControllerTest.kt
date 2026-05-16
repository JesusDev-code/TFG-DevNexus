package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.TicketCreateDto
import com.example.SpringBoot.TFG.dto.TicketDto
import com.example.SpringBoot.TFG.service.TicketService
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

@WebMvcTest(TicketController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
@MockBean(com.example.SpringBoot.TFG.repository.UsuarioRepository::class)
class TicketControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var ticketService: TicketService

    private fun makeTicket(id: Int, titulo: String) = TicketDto(
        id = id,
        codigo = "TKT-00$id",
        titulo = titulo,
        descripcion = "Descripción de prueba",
        estado = "ABIERTO",
        prioridad = "MEDIA",
        fechaCreacion = LocalDateTime.now(),
        usuarioNombre = "Test User"
    )

    // ────────────────────────────────────────────────────────────────────
    // GET /api/tickets
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET listarTodos retorna 200 con lista de tickets`() {
        given(ticketService.listarTodos()).willReturn(listOf(makeTicket(1, "Bug crítico")))

        mockMvc.perform(get("/api/tickets"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].titulo").value("Bug crítico"))
            .andExpect(jsonPath("$[0].estado").value("ABIERTO"))
    }

    @Test
    fun `GET listarTodos retorna 200 con lista vacia`() {
        given(ticketService.listarTodos()).willReturn(emptyList())

        mockMvc.perform(get("/api/tickets"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$").isEmpty)
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/tickets/mis-tickets
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET mis-tickets retorna 200 con tickets del usuario`() {
        given(ticketService.listarMisTickets()).willReturn(listOf(makeTicket(2, "Mi ticket")))

        mockMvc.perform(get("/api/tickets/mis-tickets"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].titulo").value("Mi ticket"))
    }

    // ────────────────────────────────────────────────────────────────────
    // POST /api/tickets
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST crear retorna 201 con el ticket creado`() {
        val dto = TicketCreateDto(titulo = "Nuevo ticket", descripcion = "Descripción")
        val ticketCreado = makeTicket(3, "Nuevo ticket")
        given(ticketService.crearTicket(dto)).willReturn(ticketCreado)

        mockMvc.perform(
            post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.titulo").value("Nuevo ticket"))
    }

    @Test
    fun `POST crear llama al service con los datos correctos`() {
        val dto = TicketCreateDto(titulo = "Ticket importante", descripcion = null)
        given(ticketService.crearTicket(dto)).willReturn(makeTicket(4, "Ticket importante"))

        mockMvc.perform(
            post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isCreated)

        verify(ticketService).crearTicket(dto)
    }

    // ────────────────────────────────────────────────────────────────────
    // PUT /api/tickets/{id}/estado
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `PUT cambiarEstado retorna 200 con el ticket actualizado`() {
        val ticketActualizado = makeTicket(1, "Bug crítico").copy(estado = "CERRADO")
        given(ticketService.cambiarEstado(1, "CERRADO", "Resuelto")).willReturn(ticketActualizado)

        val body = mapOf("nuevoEstado" to "CERRADO", "comentario" to "Resuelto")
        mockMvc.perform(
            put("/api/tickets/1/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.estado").value("CERRADO"))
    }
}
