package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.MensajeCreateDto
import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.*
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class MensajeServiceTest {

    @Mock lateinit var repo: MensajeRepository
    @Mock lateinit var conversacionRepo: ConversacionRepository
    @Mock lateinit var participanteRepo: ConversacionParticipanteRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var notificacionService: NotificacionService

    @InjectMocks
    lateinit var mensajeService: MensajeService

    private val rol = Rol(id = 1, nombre = "USER")
    private val autor = Usuario(id = 42, firebaseUid = "user-uid", email = "user@test.com", nombre = "Autor", rol = rol)
    private val receptor = Usuario(id = 99, firebaseUid = "otro-uid", email = "otro@test.com", nombre = "Receptor", rol = rol)

    private val principal = UserPrincipal(
        uid = "user-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 42
    )
    private val principalAdmin = UserPrincipal(
        uid = "admin-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        userId = 1
    )

    // ────────────────────────────────────────────────────────────────────
    // marcarComoLeidos (test original + ampliado)
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `marcarComoLeidos usa query especifica y nunca findAll`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByConversacionIdAndAutorIdNotAndLeidoEnIsNull(1, 42)).willReturn(emptyList())

        mensajeService.marcarComoLeidos(1)

        verify(repo).findByConversacionIdAndAutorIdNotAndLeidoEnIsNull(1, 42)
        verify(repo, never()).findAll()
    }

    @Test
    fun `marcarComoLeidos guarda todos los mensajes pendientes como leidos`() {
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.individual, creadoPor = autor)
        val msg1 = Mensaje(id = 1, texto = "Hola", autor = receptor, conversacion = conv)
        val msg2 = Mensaje(id = 2, texto = "Qué tal", autor = receptor, conversacion = conv)
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByConversacionIdAndAutorIdNotAndLeidoEnIsNull(1, 42)).willReturn(listOf(msg1, msg2))
        given(repo.saveAll(any<List<Mensaje>>())).willReturn(listOf(msg1, msg2))

        mensajeService.marcarComoLeidos(1)

        verify(repo).saveAll(any<List<Mensaje>>())
    }

    // ────────────────────────────────────────────────────────────────────
    // obtenerMensajes
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `obtenerMensajes lanza FORBIDDEN si el usuario no es participante`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(participanteRepo.existsById(ConversacionParticipanteId(5, 42))).willReturn(false)

        val ex = assertThrows<ResponseStatusException> { mensajeService.obtenerMensajes(5) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verifyNoInteractions(repo)
    }

    @Test
    fun `obtenerMensajes retorna lista cuando el usuario es participante`() {
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.individual, creadoPor = autor)
        val mensaje = Mensaje(id = 1, texto = "Hola", autor = autor, conversacion = conv)
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(participanteRepo.existsById(ConversacionParticipanteId(1, 42))).willReturn(true)
        given(repo.findByConversacionIdOrderByFechaEnvioDesc(1, Pageable.unpaged()))
            .willReturn(PageImpl(listOf(mensaje)))

        val result = mensajeService.obtenerMensajes(1)

        assertThat(result).hasSize(1)
        assertThat(result[0].texto).isEqualTo("Hola")
    }

    @Test
    fun `obtenerMensajes permite al ADMIN ver sin ser participante`() {
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.individual, creadoPor = autor)
        given(securityService.getUserPrincipal()).willReturn(principalAdmin)
        // Admin no es participante (existsById = false), pero tiene ROLE_ADMIN
        given(participanteRepo.existsById(ConversacionParticipanteId(1, 1))).willReturn(false)
        given(repo.findByConversacionIdOrderByFechaEnvioDesc(1, Pageable.unpaged()))
            .willReturn(PageImpl(emptyList()))

        val result = mensajeService.obtenerMensajes(1)

        assertThat(result).isEmpty()
        // No debe lanzar excepción
    }
}
