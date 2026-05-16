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
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.ArgumentMatchers.eq
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.BDDMockito.given
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class TicketServiceTest {

    // Kotlin-Mockito workaround: registers the matcher AND bypasses null check via unchecked generic cast.
    @Suppress("UNCHECKED_CAST")
    private fun <T> anyK(): T { org.mockito.Mockito.any<T>(); return null as T }

    @Suppress("UNCHECKED_CAST")
    private fun <T> eqK(value: T): T { org.mockito.Mockito.eq(value); return null as T }

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

    @Test
    fun `crearTicket notifica al usuario tras crear el ticket`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))

        val ticketGuardado = Ticket(id = 2, titulo = "Error crítico", usuario = usuario, estado = TicketEstado.ABIERTO)
        given(ticketRepo.save(any(Ticket::class.java))).willReturn(ticketGuardado)

        ticketService.crearTicket(TicketCreateDto(titulo = "Error crítico", descripcion = "Detalle"))

        verify(notificacionService).enviar(
            eqK(usuario),
            anyString(),
            anyString(),
            anyK()
        )
    }

    @Test
    fun `listarMisTickets retorna solo los tickets del usuario autenticado`() {
        val ticketUsuario = Ticket(id = 1, titulo = "Mi ticket", usuario = usuario, estado = TicketEstado.ABIERTO)
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(ticketRepo.findByUsuarioId(1)).willReturn(listOf(ticketUsuario))

        val result = ticketService.listarMisTickets()

        verify(ticketRepo).findByUsuarioId(1)
        assertThat(result).hasSize(1)
        assertThat(result[0].titulo).isEqualTo("Mi ticket")
    }

    @Test
    fun `listarTodos para STAFF llama a findAll`() {
        val principalStaff = UserPrincipal(
            uid = "staff-uid",
            authorities = listOf(SimpleGrantedAuthority("ROLE_STAFF")),
            userId = 2
        )
        given(securityService.getUserPrincipal()).willReturn(principalStaff)
        given(ticketRepo.findAll()).willReturn(emptyList())

        ticketService.listarTodos()

        verify(ticketRepo).findAll()
        verify(ticketRepo, never()).findByUsuarioId(anyInt())
    }
}
