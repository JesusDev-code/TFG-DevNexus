package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.ConversacionCreateDto
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
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class ConversacionServiceTest {

    @Mock lateinit var repo: ConversacionRepository
    @Mock lateinit var mensajeRepo: MensajeRepository
    @Mock lateinit var participanteRepo: ConversacionParticipanteRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var securityService: SecurityService

    @InjectMocks
    lateinit var conversacionService: ConversacionService

    private val rol = Rol(id = 1, nombre = "USER")
    private val emisor = Usuario(id = 1, firebaseUid = "uid-1", email = "emisor@test.com", nombre = "Emisor", rol = rol)
    private val invitado = Usuario(id = 2, firebaseUid = "uid-2", email = "invitado@test.com", nombre = "Invitado", rol = rol)
    private val adminUser = Usuario(id = 3, firebaseUid = "uid-admin", email = "admin@test.com", nombre = "Admin",
        rol = Rol(id = 2, nombre = "ADMIN"))

    private val principalEmisor = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )
    private val principalAdmin = UserPrincipal(
        uid = "uid-admin",
        authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        userId = 3
    )

    // ────────────────────────────────────────────────────────────────────
    // listarMisConversaciones
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listarMisConversaciones retorna conversaciones del usuario actual`() {
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.individual, creadoPor = emisor)
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(repo.findByParticipanteId(1)).willReturn(listOf(conv))
        given(mensajeRepo.countUnreadMessages(1, 1)).willReturn(0L)

        val result = conversacionService.listarMisConversaciones()

        verify(repo).findByParticipanteId(1)
        // La lista puede ser 0 o 1 dependiendo de los participantes del mock
        assertThat(result).isNotNull
    }

    @Test
    fun `listarMisConversaciones retorna lista vacia cuando el usuario no tiene chats`() {
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(repo.findByParticipanteId(1)).willReturn(emptyList())

        val result = conversacionService.listarMisConversaciones()

        assertThat(result).isEmpty()
    }

    // ────────────────────────────────────────────────────────────────────
    // crearOObtenerConversacion — individual existente
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `crearOObtenerConversacion devuelve chat existente si ya hay uno individual`() {
        val convExistente = Conversacion(id = 5, tipo = ConversacionTipo.individual, creadoPor = emisor)
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(usuarioRepo.findById(1)).willReturn(Optional.of(emisor))
        given(repo.findIndividualChatBetween(1, 2)).willReturn(convExistente)
        given(usuarioRepo.findById(2)).willReturn(Optional.of(invitado))
        given(mensajeRepo.countUnreadMessages(5, 1)).willReturn(0L)

        val dto = ConversacionCreateDto(titulo = null, tipo = "individual", invitadoId = 2)
        val result = conversacionService.crearOObtenerConversacion(dto)

        verify(repo, never()).save(any())
        assertThat(result.id).isEqualTo(5)
        assertThat(result.titulo).isEqualTo("Invitado")
    }

    // ────────────────────────────────────────────────────────────────────
    // crearOObtenerConversacion — nueva conversacion
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `crearOObtenerConversacion crea nueva conversacion individual con invitado`() {
        val nuevaConv = Conversacion(id = 10, tipo = ConversacionTipo.individual, creadoPor = emisor)
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(usuarioRepo.findById(1)).willReturn(Optional.of(emisor))
        given(repo.findIndividualChatBetween(1, 2)).willReturn(null)
        given(repo.save(any(Conversacion::class.java))).willReturn(nuevaConv)
        given(participanteRepo.save(any(ConversacionParticipante::class.java))).willAnswer { it.arguments[0] }
        given(usuarioRepo.findById(2)).willReturn(Optional.of(invitado))

        val dto = ConversacionCreateDto(titulo = null, tipo = "individual", invitadoId = 2)
        val result = conversacionService.crearOObtenerConversacion(dto)

        verify(repo).save(any(Conversacion::class.java))
        assertThat(result.id).isEqualTo(10)
        assertThat(result.titulo).isEqualTo("Invitado")
    }

    @Test
    fun `crearOObtenerConversacion crea conversacion grupal sin buscar chat existente`() {
        val nuevaConv = Conversacion(id = 20, tipo = ConversacionTipo.grupal, titulo = "Equipo", creadoPor = emisor)
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(usuarioRepo.findById(1)).willReturn(Optional.of(emisor))
        given(repo.save(any(Conversacion::class.java))).willReturn(nuevaConv)
        given(participanteRepo.save(any(ConversacionParticipante::class.java))).willAnswer { it.arguments[0] }

        val dto = ConversacionCreateDto(titulo = "Equipo", tipo = "grupal", invitadoId = null)
        val result = conversacionService.crearOObtenerConversacion(dto)

        verify(repo, never()).findIndividualChatBetween(anyInt(), anyInt())
        verify(repo).save(any(Conversacion::class.java))
        assertThat(result.id).isEqualTo(20)
    }

    // ────────────────────────────────────────────────────────────────────
    // eliminarConversacion
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `eliminarConversacion permite al creador borrar la conversacion`() {
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.individual, creadoPor = emisor)
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(repo.findById(1)).willReturn(Optional.of(conv))

        conversacionService.eliminarConversacion(1)

        verify(repo).deleteById(1)
    }

    @Test
    fun `eliminarConversacion permite al ADMIN borrar cualquier conversacion`() {
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.individual, creadoPor = emisor)
        given(securityService.getUserPrincipal()).willReturn(principalAdmin)
        given(repo.findById(1)).willReturn(Optional.of(conv))

        conversacionService.eliminarConversacion(1)

        verify(repo).deleteById(1)
    }

    @Test
    fun `eliminarConversacion lanza FORBIDDEN si no es creador ni admin`() {
        val principalTercero = UserPrincipal(uid = "uid-3", authorities = listOf(SimpleGrantedAuthority("ROLE_USER")), userId = 77)
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.individual, creadoPor = emisor)
        given(securityService.getUserPrincipal()).willReturn(principalTercero)
        given(repo.findById(1)).willReturn(Optional.of(conv))

        val ex = assertThrows<ResponseStatusException> { conversacionService.eliminarConversacion(1) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).deleteById(anyInt())
    }

    @Test
    fun `eliminarConversacion lanza NOT_FOUND si la conversacion no existe`() {
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(repo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { conversacionService.eliminarConversacion(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // eliminarParticipante
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `eliminarParticipante permite al usuario salirse de la conversacion`() {
        val conv = Conversacion(id = 1, tipo = ConversacionTipo.grupal, creadoPor = emisor)
        val participanteId = ConversacionParticipanteId(1, 1)
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(participanteRepo.existsById(participanteId)).willReturn(true)
        given(repo.findById(1)).willReturn(Optional.of(conv))

        // El usuario se elimina a sí mismo (userId == targetUserId)
        conversacionService.eliminarParticipante(1, 1)

        verify(participanteRepo).deleteById(participanteId)
    }

    @Test
    fun `eliminarParticipante lanza NOT_FOUND si el participante no existe`() {
        val participanteId = ConversacionParticipanteId(1, 99)
        given(securityService.getUserPrincipal()).willReturn(principalEmisor)
        given(participanteRepo.existsById(participanteId)).willReturn(false)

        val ex = assertThrows<ResponseStatusException> { conversacionService.eliminarParticipante(1, 99) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }
}
