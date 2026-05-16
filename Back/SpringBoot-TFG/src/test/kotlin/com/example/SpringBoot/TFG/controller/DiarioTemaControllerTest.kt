package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.*
import com.example.SpringBoot.TFG.service.DiarioColaboracionService
import com.example.SpringBoot.TFG.service.DiarioTemaService
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

@WebMvcTest(DiarioTemaController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
@MockBean(com.example.SpringBoot.TFG.repository.UsuarioRepository::class)
class DiarioTemaControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var service: DiarioTemaService
    @MockBean lateinit var colaboracionService: DiarioColaboracionService

    private fun makeTemaDto(id: Int, titulo: String, vis: String = "PRIVADO") = DiarioTemaDto(
        id = id,
        titulo = titulo,
        descripcion = "Descripción de $titulo",
        usuarioId = 1,
        usuarioNombre = "Test User",
        visibilidad = vis,
        tituloPublicacion = null,
        descripcionPublicacion = null
    )

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diario-temas
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET list retorna 200 con mis temas`() {
        given(service.listMisTemas()).willReturn(listOf(makeTemaDto(1, "Proyecto A"), makeTemaDto(2, "Proyecto B")))

        mockMvc.perform(get("/api/diario-temas"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].titulo").value("Proyecto A"))
    }

    @Test
    fun `GET list retorna 200 con lista vacia`() {
        given(service.listMisTemas()).willReturn(emptyList())

        mockMvc.perform(get("/api/diario-temas"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isEmpty)
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diario-temas/publicos
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET publicos retorna 200 con temas publicos`() {
        given(service.listTemaPublicos()).willReturn(listOf(makeTemaDto(3, "Open Source", "PUBLICO")))

        mockMvc.perform(get("/api/diario-temas/publicos"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].visibilidad").value("PUBLICO"))
    }

    // ────────────────────────────────────────────────────────────────────
    // POST /api/diario-temas
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST crear retorna 201 con el tema creado`() {
        val dto = DiarioTemaCreateDto(titulo = "Nuevo Proyecto", descripcion = "Mi primer repositorio")
        val temaCreado = makeTemaDto(10, "Nuevo Proyecto")
        given(service.create(dto)).willReturn(temaCreado)

        mockMvc.perform(
            post("/api/diario-temas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.titulo").value("Nuevo Proyecto"))
            .andExpect(jsonPath("$.id").value(10))
    }

    @Test
    fun `POST crear llama al service con el dto correcto`() {
        val dto = DiarioTemaCreateDto(titulo = "Test Repo", descripcion = null)
        given(service.create(dto)).willReturn(makeTemaDto(11, "Test Repo"))

        mockMvc.perform(
            post("/api/diario-temas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isCreated)

        verify(service).create(dto)
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diario-temas/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET getById retorna 200 con el tema`() {
        given(service.getById(10)).willReturn(makeTemaDto(10, "Proyecto Alpha"))

        mockMvc.perform(get("/api/diario-temas/10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.titulo").value("Proyecto Alpha"))
    }

    // ────────────────────────────────────────────────────────────────────
    // DELETE /api/diario-temas/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `DELETE retorna 204`() {
        mockMvc.perform(delete("/api/diario-temas/10"))
            .andExpect(status().isNoContent)

        verify(service).delete(10)
    }

    // ────────────────────────────────────────────────────────────────────
    // POST /api/diario-temas/{id}/invitar
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST invitar retorna 200 y llama al service de colaboracion`() {
        val body = InvitarUsuarioDto(email = "colaborador@test.com")

        mockMvc.perform(
            post("/api/diario-temas/10/invitar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
        )
            .andExpect(status().isOk)

        verify(colaboracionService).invitarUsuario(10, "colaborador@test.com")
    }

    // ────────────────────────────────────────────────────────────────────
    // POST /api/diario-temas/invitaciones/{id}/responder
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST responder aceptar retorna 200`() {
        mockMvc.perform(
            post("/api/diario-temas/invitaciones/5/responder")
                .param("aceptar", "true")
        )
            .andExpect(status().isOk)

        verify(colaboracionService).responderInvitacion(5L, true)
    }

    @Test
    fun `POST responder rechazar retorna 200`() {
        mockMvc.perform(
            post("/api/diario-temas/invitaciones/5/responder")
                .param("aceptar", "false")
        )
            .andExpect(status().isOk)

        verify(colaboracionService).responderInvitacion(5L, false)
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diario-temas/{id}/colaboradores
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET colaboradores retorna 200 con lista de colaboradores`() {
        val colaboradores = listOf(ColaboradorDto(2, "Colaborador", null))
        given(colaboracionService.getColaboradoresDeTema(10)).willReturn(colaboradores)

        mockMvc.perform(get("/api/diario-temas/10/colaboradores"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].nombre").value("Colaborador"))
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diario-temas/invitaciones/pendientes
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET invitaciones pendientes retorna 200 con lista`() {
        val pendientes = listOf(
            InvitacionPendienteDto(id = 1L, temaTitulo = "Proyecto X", ownerNombre = "Admin", fecha = "2025-01-01")
        )
        given(colaboracionService.misInvitacionesPendientes()).willReturn(pendientes)

        mockMvc.perform(get("/api/diario-temas/invitaciones/pendientes"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].temaTitulo").value("Proyecto X"))
    }
}
