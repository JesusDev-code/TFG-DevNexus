package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.EventoCreateDto
import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.EventoRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.BDDMockito.given
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class EventoServiceTest {

    @Mock lateinit var repo: EventoRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var notificacionService: NotificacionService
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var auditoriaService: AuditoriaService

    @InjectMocks
    lateinit var eventoService: EventoService

    private val rol = Rol(id = 1, nombre = "USER")
    private val usuario = Usuario(id = 10, firebaseUid = "user-uid", email = "user@test.com", nombre = "User", rol = rol)

    private val principalUser = UserPrincipal(
        uid = "user-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 10
    )
    private val principalAdmin = UserPrincipal(
        uid = "admin-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        userId = 99
    )

    private fun makeCreateDto(vis: EventoVisibilidad = EventoVisibilidad.PRIVADO) = EventoCreateDto(
        titulo = "Evento Test",
        descripcion = null,
        fechaEvento = LocalDate.of(2025, 8, 1),
        horaEvento = LocalTime.of(10, 0),
        visibilidad = vis
    )

    // ────────────────────────────────────────────────────────────────────
    // listarSeguro (test original + ampliado)
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listarSeguro para usuario sin rol admin llama findPublicosOrByUsuarioId y nunca findAll`() {
        given(securityService.getUserPrincipal()).willReturn(principalUser)
        given(securityService.hasRole("ADMIN", "STAFF")).willReturn(false)
        given(repo.findPublicosOrByUsuarioId(10)).willReturn(emptyList())

        eventoService.listarSeguro()

        verify(repo).findPublicosOrByUsuarioId(10)
        verify(repo, never()).findAll()
    }

    @Test
    fun `listarSeguro para ADMIN llama findAll y nunca findPublicosOrByUsuarioId`() {
        given(securityService.getUserPrincipal()).willReturn(principalAdmin)
        given(securityService.hasRole("ADMIN", "STAFF")).willReturn(true)
        given(repo.findAll()).willReturn(emptyList())

        eventoService.listarSeguro()

        verify(repo).findAll()
        verify(repo, never()).findPublicosOrByUsuarioId(anyInt())
    }

    // ────────────────────────────────────────────────────────────────────
    // crearEventoSeguro
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `crearEventoSeguro para usuario normal cambia visibilidad PUBLICO a PRIVADO`() {
        given(securityService.getUserPrincipal()).willReturn(principalUser)
        given(securityService.hasRole("ADMIN", "STAFF")).willReturn(false)
        given(usuarioRepo.findById(10)).willReturn(Optional.of(usuario))

        val eventoGuardado = Evento(
            id = 1, titulo = "Evento Test", fechaEvento = LocalDate.of(2025, 8, 1),
            horaEvento = LocalTime.of(10, 0), visibilidad = EventoVisibilidad.PRIVADO, usuario = usuario
        )
        given(repo.save(any(Evento::class.java))).willReturn(eventoGuardado)

        val result = eventoService.crearEventoSeguro(makeCreateDto(EventoVisibilidad.PUBLICO))

        val captor = ArgumentCaptor.forClass(Evento::class.java)
        verify(repo).save(captor.capture())
        // Usuario normal no puede crear públicos — debe ser PRIVADO
        assertThat(captor.value.visibilidad).isEqualTo(EventoVisibilidad.PRIVADO)
    }

    @Test
    fun `crearEventoSeguro para ADMIN preserva visibilidad PUBLICO`() {
        given(securityService.getUserPrincipal()).willReturn(principalAdmin)
        given(securityService.hasRole("ADMIN", "STAFF")).willReturn(true)
        given(usuarioRepo.findById(99)).willReturn(Optional.of(
            Usuario(id = 99, firebaseUid = "admin-uid", email = "admin@test.com", nombre = "Admin", rol = Rol(id = 2, nombre = "ADMIN"))
        ))

        val eventoPublico = Evento(
            id = 2, titulo = "Evento Test", fechaEvento = LocalDate.of(2025, 8, 1),
            horaEvento = LocalTime.of(10, 0), visibilidad = EventoVisibilidad.PUBLICO,
            usuario = Usuario(id = 99, firebaseUid = "admin-uid", email = "admin@test.com", nombre = "Admin", rol = Rol(id = 2, nombre = "ADMIN"))
        )
        given(repo.save(any(Evento::class.java))).willReturn(eventoPublico)
        // Para los eventos públicos se notifica a todos → necesitamos un findAll que retorne vacío
        given(usuarioRepo.findAll(any(Pageable::class.java))).willReturn(PageImpl(emptyList()))

        eventoService.crearEventoSeguro(makeCreateDto(EventoVisibilidad.PUBLICO))

        val captor = ArgumentCaptor.forClass(Evento::class.java)
        verify(repo).save(captor.capture())
        assertThat(captor.value.visibilidad).isEqualTo(EventoVisibilidad.PUBLICO)
    }

    // ────────────────────────────────────────────────────────────────────
    // eliminarEventoSeguro
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `eliminarEventoSeguro permite al duenio borrar su evento PRIVADO`() {
        val eventoPrivado = Evento(
            id = 5, titulo = "Mi Evento", fechaEvento = LocalDate.now(),
            horaEvento = LocalTime.NOON, visibilidad = EventoVisibilidad.PRIVADO, usuario = usuario
        )
        given(securityService.hasRole("ADMIN")).willReturn(false)
        given(securityService.getUserPrincipal()).willReturn(principalUser)
        given(repo.findById(5)).willReturn(Optional.of(eventoPrivado))

        eventoService.eliminarEventoSeguro(5)

        verify(repo).deleteById(5)
    }

    @Test
    fun `eliminarEventoSeguro lanza FORBIDDEN si usuario intenta borrar evento de otro`() {
        val principalOtro = UserPrincipal(uid = "otro-uid", authorities = listOf(SimpleGrantedAuthority("ROLE_USER")), userId = 55)
        val eventoAjeno = Evento(
            id = 5, titulo = "Evento Ajeno", fechaEvento = LocalDate.now(),
            horaEvento = LocalTime.NOON, visibilidad = EventoVisibilidad.PRIVADO, usuario = usuario
        )
        given(securityService.hasRole("ADMIN")).willReturn(false)
        given(securityService.getUserPrincipal()).willReturn(principalOtro)
        given(repo.findById(5)).willReturn(Optional.of(eventoAjeno))

        val ex = assertThrows<ResponseStatusException> { eventoService.eliminarEventoSeguro(5) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).deleteById(anyInt())
    }

    @Test
    fun `eliminarEventoSeguro lanza NOT_FOUND si el evento no existe`() {
        given(repo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { eventoService.eliminarEventoSeguro(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }
}
