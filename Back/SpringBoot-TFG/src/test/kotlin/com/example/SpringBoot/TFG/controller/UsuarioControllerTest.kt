package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.UsuarioDto
import com.example.SpringBoot.TFG.dto.UsuarioUpdateDto
import com.example.SpringBoot.TFG.model.Departamento
import com.example.SpringBoot.TFG.model.Rol
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.repository.DepartamentoRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.security.UserPrincipal
import com.example.SpringBoot.TFG.service.SecurityService
import com.example.SpringBoot.TFG.service.UsuarioService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.Optional

@WebMvcTest(UsuarioController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
class UsuarioControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var service: UsuarioService
    @MockBean lateinit var usuarioRepo: UsuarioRepository
    @MockBean lateinit var securityService: SecurityService
    @MockBean lateinit var departamentoRepo: DepartamentoRepository

    private val principal = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )
    private val rol = Rol(id = 1, nombre = "USER")
    private val departamento = Departamento(id = 1, nombre = "General")
    private val usuario = Usuario(
        id = 1, firebaseUid = "uid-1", email = "user@test.com",
        nombre = "Test User", rol = rol, departamento = departamento
    )
    private val usuarioDto = UsuarioDto(
        id = 1, nombre = "Test User", biografia = null, foto_perfil = null,
        email = "user@test.com", rolNombre = "USER", departamentoNombre = "General",
        departamentoId = 1, permiteContacto = true, motivoNoContacto = null
    )

    // ────────────────────────────────────────────────────────────────────
    // GET /api/usuarios/perfil
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET perfil retorna 200 con datos del usuario autenticado`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))

        mockMvc.perform(get("/api/usuarios/perfil"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value("user@test.com"))
            .andExpect(jsonPath("$.nombre").value("Test User"))
    }

    // ────────────────────────────────────────────────────────────────────
    // PUT /api/usuarios/perfil
    // ────────────────────────────────────────────────────────────────────

    private fun makeUpdateDto(nombre: String? = null) = UsuarioUpdateDto(
        nombre = nombre, biografia = null, foto_perfil = null,
        permiteContacto = null, motivoNoContacto = null,
        departamentoId = null, rolId = null
    )

    @Test
    fun `PUT perfil retorna 200 con el perfil actualizado`() {
        val updates = makeUpdateDto(nombre = "Nombre Nuevo")
        val dtoActualizado = usuarioDto.copy(nombre = "Nombre Nuevo")
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(service.update(1, updates)).willReturn(dtoActualizado)

        mockMvc.perform(
            put("/api/usuarios/perfil")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.nombre").value("Nombre Nuevo"))
    }

    @Test
    fun `PUT perfil llama al service con el id del usuario autenticado`() {
        val updates = makeUpdateDto(nombre = "Nuevo Nombre")
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(service.update(1, updates)).willReturn(usuarioDto)

        mockMvc.perform(
            put("/api/usuarios/perfil")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates))
        )
            .andExpect(status().isOk)

        verify(service).update(1, updates)
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/usuarios/por-departamento/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET por-departamento retorna 200 con usuarios del departamento`() {
        given(service.buscarPorDepartamento(1)).willReturn(listOf(usuarioDto))

        mockMvc.perform(get("/api/usuarios/por-departamento/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].email").value("user@test.com"))
    }

    // ────────────────────────────────────────────────────────────────────
    // GET /api/usuarios/{id}
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `GET getById retorna 200 cuando el usuario consulta su propio perfil`() {
        val principalAdmin = UserPrincipal(
            uid = "uid-admin",
            authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            userId = 99
        )
        given(securityService.getUserPrincipal()).willReturn(principalAdmin)
        given(service.getById(1)).willReturn(usuarioDto)

        mockMvc.perform(get("/api/usuarios/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
    }

    // ────────────────────────────────────────────────────────────────────
    // DELETE /api/usuarios/perfil
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `DELETE perfil retorna 204`() {
        given(securityService.getUserPrincipal()).willReturn(principal)

        mockMvc.perform(delete("/api/usuarios/perfil"))
            .andExpect(status().isNoContent)

        verify(service).delete(1)
    }
}
