package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.config.WebMvcTestSecurityConfig
import com.example.SpringBoot.TFG.dto.GoogleLoginDto
import com.example.SpringBoot.TFG.dto.UsuarioDto
import com.example.SpringBoot.TFG.security.UserPrincipal
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AuthController::class)
@Import(WebMvcTestSecurityConfig::class)
@ActiveProfiles("test")
@MockBean(com.google.firebase.auth.FirebaseAuth::class)
@MockBean(com.example.SpringBoot.TFG.repository.UsuarioRepository::class)
class AuthControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var usuarioService: UsuarioService

    private val principal = UserPrincipal(
        uid = "firebase-uid-google",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )

    private val mockAuth = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)

    private val usuarioDto = UsuarioDto(
        id = 1, nombre = "Google User", biografia = null, foto_perfil = "https://photo.url",
        email = "google@test.com", rolNombre = "USER", departamentoNombre = "General",
        departamentoId = 1, fcmToken = null, permiteContacto = true, motivoNoContacto = null
    )

    // ────────────────────────────────────────────────────────────────────
    // POST /api/auth/google
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `POST google login retorna 200 con datos del usuario`() {
        val body = GoogleLoginDto(email = "google@test.com", nombre = "Google User", foto = "https://photo.url")
        given(usuarioService.sincronizarGoogle("firebase-uid-google", "google@test.com", "Google User", "https://photo.url"))
            .willReturn(usuarioDto)

        mockMvc.perform(
            post("/api/auth/google")
                .with(authentication(mockAuth))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value("google@test.com"))
            .andExpect(jsonPath("$.nombre").value("Google User"))
            .andExpect(jsonPath("$.rolNombre").value("USER"))
    }

    @Test
    fun `POST google login llama al service con uid del principal y datos del body`() {
        val body = GoogleLoginDto(email = "google@test.com", nombre = "Google User", foto = null)
        given(usuarioService.sincronizarGoogle("firebase-uid-google", "google@test.com", "Google User", null))
            .willReturn(usuarioDto)

        mockMvc.perform(
            post("/api/auth/google")
                .with(authentication(mockAuth))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
        )
            .andExpect(status().isOk)

        verify(usuarioService).sincronizarGoogle("firebase-uid-google", "google@test.com", "Google User", null)
    }
}
