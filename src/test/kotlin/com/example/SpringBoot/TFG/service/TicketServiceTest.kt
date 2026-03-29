package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.TicketCreateDto
import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.*
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.any
import org.mockito.Mockito.verify
import org.mockito.BDDMockito.given
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class TicketServiceTest {

    @Mock lateinit var ticketRepo: TicketRepository
    @Mock lateinit var historicoRepo: TicketHistoricoRepository
    @Mock lateinit var comentarioRepo: TicketComentarioRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var notificacionRepository: NotificacionRepository
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var notificacionService: NotificacionService
    @Mock lateinit var auditoriaService: AuditoriaService

    @InjectMocks
    lateinit var ticketService: TicketService

    private val rol = Rol(id = 1, nombre = "USER")
    private val usuario = Usuario(
        id = 1, firebaseUid = "test-uid", email = "test@test.com",
        nombre = "Test User", rol = rol
    )
    private val principal = UserPrincipal(
        uid = "test-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )

    @Test
    fun `crearTicket persiste el ticket con estado ABIERTO`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))

        val ticketGuardado = Ticket(id = 1, titulo = "Problema", usuario = usuario, estado = TicketEstado.ABIERTO)
        given(ticketRepo.save(any(Ticket::class.java))).willReturn(ticketGuardado)

        ticketService.crearTicket(TicketCreateDto(titulo = "Problema", descripcion = null))

        val captor = ArgumentCaptor.forClass(Ticket::class.java)
        verify(ticketRepo).save(captor.capture())
        assertThat(captor.value.estado).isEqualTo(TicketEstado.ABIERTO)
    }
}
