package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.DiarioColaboracionRepository
import com.example.SpringBoot.TFG.repository.DiarioTemaRepository
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
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class DiarioColaboracionServiceTest {

    @Mock lateinit var colaboracionRepo: DiarioColaboracionRepository
    @Mock lateinit var diarioTemaRepo: DiarioTemaRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var securityService: SecurityService

    @InjectMocks
    lateinit var colaboracionService: DiarioColaboracionService

    private val rol = Rol(id = 1, nombre = "USER")
    private val duenio = Usuario(id = 1, firebaseUid = "uid-1", email = "duenio@test.com", nombre = "Dueño", rol = rol)
    private val invitado = Usuario(id = 2, firebaseUid = "uid-2", email = "invitado@test.com", nombre = "Invitado", rol = rol)
    private val tema = DiarioTema(id = 10, titulo = "Mi Proyecto", usuario = duenio)

    private val principalDuenio = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )
    private val principalInvitado = UserPrincipal(
        uid = "uid-2",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 2
    )
    private val principalTercero = UserPrincipal(
        uid = "uid-3",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 3
    )

    // ────────────────────────────────────────────────────────────────────
    // invitarUsuario
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `invitarUsuario crea invitacion PENDIENTE cuando el duenio invita a otro usuario`() {
        given(securityService.getUserPrincipal()).willReturn(principalDuenio)
        given(diarioTemaRepo.findById(10)).willReturn(Optional.of(tema))
        given(usuarioRepo.findByEmail("invitado@test.com")).willReturn(Optional.of(invitado))
        given(colaboracionRepo.existsByTemaIdAndUsuarioId(10, 2)).willReturn(false)

        val invitacionGuardada = DiarioColaboracion(id = 1L, tema = tema, usuario = invitado, estado = InvitacionEstado.PENDIENTE)
        given(colaboracionRepo.save(any(DiarioColaboracion::class.java))).willReturn(invitacionGuardada)

        colaboracionService.invitarUsuario(10, "invitado@test.com")

        val captor = ArgumentCaptor.forClass(DiarioColaboracion::class.java)
        verify(colaboracionRepo).save(captor.capture())
        assertThat(captor.value.estado).isEqualTo(InvitacionEstado.PENDIENTE)
        assertThat(captor.value.usuario.id).isEqualTo(2)
    }

    @Test
    fun `invitarUsuario lanza FORBIDDEN si quien invita no es el duenio`() {
        given(securityService.getUserPrincipal()).willReturn(principalTercero)
        given(diarioTemaRepo.findById(10)).willReturn(Optional.of(tema))

        val ex = assertThrows<ResponseStatusException> {
            colaboracionService.invitarUsuario(10, "invitado@test.com")
        }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(colaboracionRepo, never()).save(any())
    }

    @Test
    fun `invitarUsuario lanza NOT_FOUND si el tema no existe`() {
        given(securityService.getUserPrincipal()).willReturn(principalDuenio)
        given(diarioTemaRepo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> {
            colaboracionService.invitarUsuario(999, "invitado@test.com")
        }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    @Test
    fun `invitarUsuario lanza NOT_FOUND si el usuario invitado no existe`() {
        given(securityService.getUserPrincipal()).willReturn(principalDuenio)
        given(diarioTemaRepo.findById(10)).willReturn(Optional.of(tema))
        given(usuarioRepo.findByEmail("noexiste@test.com")).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> {
            colaboracionService.invitarUsuario(10, "noexiste@test.com")
        }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    @Test
    fun `invitarUsuario lanza BAD_REQUEST si el usuario ya esta invitado o colaborando`() {
        given(securityService.getUserPrincipal()).willReturn(principalDuenio)
        given(diarioTemaRepo.findById(10)).willReturn(Optional.of(tema))
        given(usuarioRepo.findByEmail("invitado@test.com")).willReturn(Optional.of(invitado))
        given(colaboracionRepo.existsByTemaIdAndUsuarioId(10, 2)).willReturn(true)

        val ex = assertThrows<ResponseStatusException> {
            colaboracionService.invitarUsuario(10, "invitado@test.com")
        }

        assertThat(ex.statusCode.value()).isEqualTo(400)
        verify(colaboracionRepo, never()).save(any())
    }

    // ────────────────────────────────────────────────────────────────────
    // responderInvitacion — aceptar
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `responderInvitacion aceptar cambia estado a ACEPTADA y guarda`() {
        val invitacion = DiarioColaboracion(id = 1L, tema = tema, usuario = invitado, estado = InvitacionEstado.PENDIENTE)
        given(securityService.getUserPrincipal()).willReturn(principalInvitado)
        given(colaboracionRepo.findById(1L)).willReturn(Optional.of(invitacion))
        given(colaboracionRepo.save(any(DiarioColaboracion::class.java))).willReturn(invitacion)

        colaboracionService.responderInvitacion(1L, true)

        val captor = ArgumentCaptor.forClass(DiarioColaboracion::class.java)
        verify(colaboracionRepo).save(captor.capture())
        assertThat(captor.value.estado).isEqualTo(InvitacionEstado.ACEPTADA)
        verify(colaboracionRepo, never()).delete(any())
    }

    @Test
    fun `responderInvitacion rechazar elimina la invitacion`() {
        val invitacion = DiarioColaboracion(id = 1L, tema = tema, usuario = invitado, estado = InvitacionEstado.PENDIENTE)
        given(securityService.getUserPrincipal()).willReturn(principalInvitado)
        given(colaboracionRepo.findById(1L)).willReturn(Optional.of(invitacion))

        colaboracionService.responderInvitacion(1L, false)

        verify(colaboracionRepo).delete(invitacion)
        verify(colaboracionRepo, never()).save(any())
    }

    @Test
    fun `responderInvitacion lanza FORBIDDEN si la invitacion no es para el usuario actual`() {
        val invitacion = DiarioColaboracion(id = 1L, tema = tema, usuario = invitado, estado = InvitacionEstado.PENDIENTE)
        given(securityService.getUserPrincipal()).willReturn(principalTercero)
        given(colaboracionRepo.findById(1L)).willReturn(Optional.of(invitacion))

        val ex = assertThrows<ResponseStatusException> {
            colaboracionService.responderInvitacion(1L, true)
        }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(colaboracionRepo, never()).save(any())
        verify(colaboracionRepo, never()).delete(any())
    }

    @Test
    fun `responderInvitacion lanza NOT_FOUND si la invitacion no existe`() {
        given(securityService.getUserPrincipal()).willReturn(principalInvitado)
        given(colaboracionRepo.findById(999L)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> {
            colaboracionService.responderInvitacion(999L, true)
        }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // getColaboradoresDeTema
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `getColaboradoresDeTema retorna solo los colaboradores ACEPTADOS`() {
        val colaboracion = DiarioColaboracion(id = 1L, tema = tema, usuario = invitado, estado = InvitacionEstado.ACEPTADA)
        given(colaboracionRepo.findByTemaIdAndEstado(10, InvitacionEstado.ACEPTADA)).willReturn(listOf(colaboracion))

        val result = colaboracionService.getColaboradoresDeTema(10)

        assertThat(result).hasSize(1)
        assertThat(result[0].id).isEqualTo(2)
        assertThat(result[0].nombre).isEqualTo("Invitado")
    }

    @Test
    fun `getColaboradoresDeTema retorna lista vacia cuando no hay colaboradores`() {
        given(colaboracionRepo.findByTemaIdAndEstado(10, InvitacionEstado.ACEPTADA)).willReturn(emptyList())

        val result = colaboracionService.getColaboradoresDeTema(10)

        assertThat(result).isEmpty()
    }

    // ────────────────────────────────────────────────────────────────────
    // misInvitacionesPendientes
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `misInvitacionesPendientes retorna invitaciones PENDIENTES del usuario actual`() {
        val invitacion = DiarioColaboracion(id = 5L, tema = tema, usuario = invitado, estado = InvitacionEstado.PENDIENTE)
        given(securityService.getUserPrincipal()).willReturn(principalInvitado)
        given(colaboracionRepo.findByUsuarioIdAndEstado(2, InvitacionEstado.PENDIENTE)).willReturn(listOf(invitacion))

        val result = colaboracionService.misInvitacionesPendientes()

        assertThat(result).hasSize(1)
        assertThat(result[0].id).isEqualTo(5L)
        assertThat(result[0].temaTitulo).isEqualTo("Mi Proyecto")
    }

    @Test
    fun `misInvitacionesPendientes retorna lista vacia cuando no hay pendientes`() {
        given(securityService.getUserPrincipal()).willReturn(principalInvitado)
        given(colaboracionRepo.findByUsuarioIdAndEstado(2, InvitacionEstado.PENDIENTE)).willReturn(emptyList())

        val result = colaboracionService.misInvitacionesPendientes()

        assertThat(result).isEmpty()
    }
}
