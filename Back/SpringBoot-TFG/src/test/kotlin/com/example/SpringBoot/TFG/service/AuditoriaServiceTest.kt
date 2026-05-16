package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.model.Auditoria
import com.example.SpringBoot.TFG.model.Rol
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.repository.AuditoriaRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.BDDMockito.given
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.any
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class AuditoriaServiceTest {

    @Mock lateinit var auditoriaRepo: AuditoriaRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository

    @InjectMocks
    lateinit var auditoriaService: AuditoriaService

    private val rol = Rol(id = 1, nombre = "USER")
    private val usuario = Usuario(
        id = 1, firebaseUid = "uid-1", email = "user@test.com",
        nombre = "Test User", rol = rol
    )
    private val principal = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )

    @BeforeEach
    fun setup() {
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun teardown() {
        SecurityContextHolder.clearContext()
    }

    private fun setAuthentication(p: UserPrincipal) {
        val auth = UsernamePasswordAuthenticationToken(p, null, p.authorities)
        SecurityContextHolder.getContext().authentication = auth
    }

    // ────────────────────────────────────────────────────────────────────
    // registrar
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `registrar guarda entrada de auditoria con datos proporcionados`() {
        given(auditoriaRepo.save(any(Auditoria::class.java))).willAnswer { it.arguments[0] }

        auditoriaService.registrar(
            accion = "CREAR",
            recurso = "Ticket",
            descripcion = "Ticket creado por prueba",
            severidad = "INFO",
            usuarioId = 1,
            usuarioEmail = "user@test.com"
        )

        val captor = ArgumentCaptor.forClass(Auditoria::class.java)
        verify(auditoriaRepo).save(captor.capture())
        assertThat(captor.value.accion).isEqualTo("CREAR")
        assertThat(captor.value.recurso).isEqualTo("Ticket")
        assertThat(captor.value.severidad).isEqualTo("INFO")
    }

    @Test
    fun `registrar toma el usuario del SecurityContext cuando no se proporciona usuarioId`() {
        setAuthentication(principal)
        given(auditoriaRepo.save(any(Auditoria::class.java))).willAnswer { it.arguments[0] }
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))

        auditoriaService.registrar(
            accion = "LOGIN",
            recurso = "Sistema",
            descripcion = "Login detectado"
        )

        val captor = ArgumentCaptor.forClass(Auditoria::class.java)
        verify(auditoriaRepo).save(captor.capture())
        assertThat(captor.value.usuarioId).isEqualTo(1)
    }

    @Test
    fun `registrar usa Sistema-Anonimo cuando no hay usuario en contexto ni parametros`() {
        // SecurityContext vacío, sin usuarioId ni email
        given(auditoriaRepo.save(any(Auditoria::class.java))).willAnswer { it.arguments[0] }

        auditoriaService.registrar(
            accion = "SISTEMA",
            recurso = "Cron",
            descripcion = "Tarea automática"
        )

        val captor = ArgumentCaptor.forClass(Auditoria::class.java)
        verify(auditoriaRepo).save(captor.capture())
        assertThat(captor.value.usuarioEmail).isEqualTo("Sistema/Anónimo")
    }

    @Test
    fun `registrar usa severidad INFO por defecto`() {
        given(auditoriaRepo.save(any(Auditoria::class.java))).willAnswer { it.arguments[0] }

        auditoriaService.registrar(
            accion = "ACCION",
            recurso = "Recurso",
            descripcion = null,
            usuarioId = 1,
            usuarioEmail = "user@test.com"
        )

        val captor = ArgumentCaptor.forClass(Auditoria::class.java)
        verify(auditoriaRepo).save(captor.capture())
        assertThat(captor.value.severidad).isEqualTo("INFO")
    }

    @Test
    fun `registrar respeta severidad DANGER cuando se indica`() {
        given(auditoriaRepo.save(any(Auditoria::class.java))).willAnswer { it.arguments[0] }

        auditoriaService.registrar(
            accion = "ELIMINAR",
            recurso = "Usuario",
            descripcion = "Borrado crítico",
            severidad = "DANGER",
            usuarioId = 1,
            usuarioEmail = "user@test.com"
        )

        val captor = ArgumentCaptor.forClass(Auditoria::class.java)
        verify(auditoriaRepo).save(captor.capture())
        assertThat(captor.value.severidad).isEqualTo("DANGER")
    }

    // ────────────────────────────────────────────────────────────────────
    // listarPaginado
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listarPaginado delega en el repo con los parametros correctos`() {
        val pageable = PageRequest.of(0, 10)
        val entrada = Auditoria(id = 1, accion = "CREAR", recurso = "Ticket", severidad = "INFO")
        given(auditoriaRepo.buscarPaginado(null, pageable)).willReturn(PageImpl(listOf(entrada)))

        val result = auditoriaService.listarPaginado(null, pageable)

        verify(auditoriaRepo).buscarPaginado(null, pageable)
        assertThat(result.totalElements).isEqualTo(1)
        assertThat(result.content[0].accion).isEqualTo("CREAR")
    }

    @Test
    fun `listarPaginado con busqueda pasa el texto al repo`() {
        val pageable = PageRequest.of(0, 5)
        given(auditoriaRepo.buscarPaginado("ticket", pageable)).willReturn(PageImpl(emptyList()))

        auditoriaService.listarPaginado("ticket", pageable)

        verify(auditoriaRepo).buscarPaginado("ticket", pageable)
    }

    // ────────────────────────────────────────────────────────────────────
    // obtenerPorId
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `obtenerPorId retorna la entrada cuando existe`() {
        val entrada = Auditoria(id = 1, accion = "LOGIN", recurso = "Sistema", severidad = "INFO")
        given(auditoriaRepo.findById(1)).willReturn(Optional.of(entrada))

        val result = auditoriaService.obtenerPorId(1)

        assertThat(result).isNotNull
        assertThat(result!!.accion).isEqualTo("LOGIN")
    }

    @Test
    fun `obtenerPorId retorna null cuando no existe`() {
        given(auditoriaRepo.findById(999)).willReturn(Optional.empty())

        val result = auditoriaService.obtenerPorId(999)

        assertThat(result).isNull()
    }
}
