package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.DiarioCreateDto
import com.example.SpringBoot.TFG.dto.DiarioDto
import com.example.SpringBoot.TFG.model.Visibilidad
import com.example.SpringBoot.TFG.security.UserPrincipal
import com.example.SpringBoot.TFG.service.DiarioService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.any
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

@WebMvcTest(DiarioController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
@MockBean(com.example.SpringBoot.TFG.repository.UsuarioRepository::class)
class DiarioControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var service: DiarioService

    @Suppress("UNCHECKED_CAST")
    private fun <T> anyK(): T { org.mockito.Mockito.any<T>(); return null as T }

    private val principalUser = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )
    private val principalAdmin = UserPrincipal(
        uid = "uid-admin",
        authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        userId = 99
    )

    private val authUser = UsernamePasswordAuthenticationToken(principalUser, null, principalUser.authorities)
    private val authAdmin = UsernamePasswordAuthenticationToken(principalAdmin, null, principalAdmin.authorities)

    private fun makeDto(id: Int, vis: String = "PUBLICO") = DiarioDto(
        id = id,
        contenido = "Contenido $id",
        visibilidad = vis,
        fechaCreacion = LocalDateTime.now(),
        usuarioId = 1,
        usuarioNombre = "Test User",
        temaId = null,
        temaTitulo = null,
        tipo = null,
        filename = null
    )

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diarios — usuario normal ve solo públicos
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET list para usuario USER llama a publicos`() {
        val page = PageImpl(listOf(makeDto(1)))
        given(service.publicos(anyK())).willReturn(page)

        mockMvc.perform(
            get("/api/diarios")
                .with(authentication(authUser))
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `GET list para ADMIN llama a listAll`() {
        val page = PageImpl(listOf(makeDto(1), makeDto(2, "PRIVADO")))
        given(service.listAll(anyK())).willReturn(page)

        mockMvc.perform(
            get("/api/diarios")
                .with(authentication(authAdmin))
        )
            .andExpect(status().isOk)
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diarios/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET getById retorna 200 cuando el diario es publico`() {
        given(service.getById(1)).willReturn(makeDto(1, "PUBLICO"))

        mockMvc.perform(
            get("/api/diarios/1")
                .with(authentication(authUser))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.visibilidad").value("PUBLICO"))
    }

    @Test
    fun `GET getById retorna 404 cuando no existe el diario`() {
        given(service.getById(999)).willReturn(null)

        mockMvc.perform(
            get("/api/diarios/999")
                .with(authentication(authUser))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `GET getById retorna 200 para diario PRIVADO si es el propietario`() {
        val dtoPrivado = makeDto(2, "PRIVADO").copy(usuarioId = 1) // principalUser.userId == 1
        given(service.getById(2)).willReturn(dtoPrivado)

        mockMvc.perform(
            get("/api/diarios/2")
                .with(authentication(authUser))
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `GET getById retorna 403 para diario PRIVADO de otro usuario`() {
        val dtoPrivado = makeDto(3, "PRIVADO").copy(usuarioId = 99) // No es el userId=1
        given(service.getById(3)).willReturn(dtoPrivado)

        mockMvc.perform(
            get("/api/diarios/3")
                .with(authentication(authUser))
        )
            .andExpect(status().isForbidden)
    }

    // ────────────────────────────────────────────────────────────────────
    // POST /api/diarios
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST crear retorna 201 con el diario creado`() {
        val dto = DiarioCreateDto(contenido = "Nueva entrada", visibilidad = Visibilidad.PUBLICO)
        val dtoCreado = makeDto(5)
        given(service.create("uid-1", dto)).willReturn(dtoCreado)

        mockMvc.perform(
            post("/api/diarios")
                .with(authentication(authUser))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(5))
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diarios/publicos
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET publicos retorna 200 con diarios publicos`() {
        val page = PageImpl(listOf(makeDto(1), makeDto(2)))
        given(service.publicos(anyK())).willReturn(page)

        mockMvc.perform(get("/api/diarios/publicos"))
            .andExpect(status().isOk)
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/diarios/tema/{temaId}/publicos
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET publicosPorTema retorna 200 con diarios publicos del tema`() {
        given(service.publicosPorTema(10)).willReturn(listOf(makeDto(1), makeDto(2)))

        mockMvc.perform(get("/api/diarios/tema/10/publicos"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
    }

    // ────────────────────────────────────────────────────────────────────
    // DELETE /api/diarios/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `DELETE retorna 204`() {
        mockMvc.perform(
            delete("/api/diarios/1")
                .with(authentication(authUser))
        )
            .andExpect(status().isNoContent)

        verify(service).delete(1)
    }
}
