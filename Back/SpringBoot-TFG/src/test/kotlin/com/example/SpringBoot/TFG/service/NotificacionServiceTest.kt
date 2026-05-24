package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.model.Notificacion
import com.example.SpringBoot.TFG.model.Plataforma
import com.example.SpringBoot.TFG.model.Rol
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.model.UsuarioFcmToken
import com.example.SpringBoot.TFG.repository.NotificacionRepository
import com.example.SpringBoot.TFG.repository.UsuarioFcmTokenRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.security.UserPrincipal
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingException
import com.google.firebase.messaging.Message
import com.google.firebase.messaging.MessagingErrorCode
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.BDDMockito.given
import org.mockito.BDDMockito.willThrow
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class NotificacionServiceTest {

    @Mock lateinit var repo: NotificacionRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var fcmTokenRepo: UsuarioFcmTokenRepository
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var fcm: FirebaseMessaging

    @InjectMocks
    lateinit var notificacionService: NotificacionService

    private val rol = Rol(id = 1, nombre = "USER")
    private val usuario = Usuario(
        id = 1, firebaseUid = "uid-1", email = "user@test.com",
        nombre = "Test User", rol = rol
    )
    private val usuarioConToken = Usuario(
        id = 2, firebaseUid = "uid-2", email = "token@test.com",
        nombre = "Token User", rol = rol
    )
    private val principal = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )

    private fun makeNotif(id: Int, msg: String, leida: Boolean = false) = Notificacion(
        id = id,
        mensaje = msg,
        usuario = usuario,
        leida = leida,
        fecha = LocalDateTime.now()
    )

    private fun fcmEntrada(token: String, user: Usuario, plataforma: Plataforma = Plataforma.ANDROID) =
        UsuarioFcmToken(id = 1, usuario = user, token = token, plataforma = plataforma)

    // ────────────────────────────────────────────────────────────────────
    // listarMisNotificaciones
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listarMisNotificaciones retorna notificaciones del usuario actual`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByUsuarioId(1)).willReturn(listOf(makeNotif(1, "Hola")))

        val result = notificacionService.listarMisNotificaciones()

        verify(repo).findByUsuarioId(1)
        assertThat(result).hasSize(1)
        assertThat(result[0].mensaje).isEqualTo("Hola")
    }

    @Test
    fun `listarMisNotificaciones retorna lista vacia cuando no hay notificaciones`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByUsuarioId(1)).willReturn(emptyList())

        val result = notificacionService.listarMisNotificaciones()

        assertThat(result).isEmpty()
    }

    // ────────────────────────────────────────────────────────────────────
    // enviar — multi-token + auto-purga
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `enviar siempre guarda la notificacion en BD aunque no haya tokens FCM`() {
        val notifGuardada = makeNotif(5, "Mensaje de prueba")
        given(repo.save(any(Notificacion::class.java))).willReturn(notifGuardada)
        given(fcmTokenRepo.findByUsuarioId(usuario.id!!)).willReturn(emptyList())

        notificacionService.enviar(usuario, "Mensaje de prueba", "Título")

        val captor = ArgumentCaptor.forClass(Notificacion::class.java)
        verify(repo).save(captor.capture())
        assertThat(captor.value.mensaje).isEqualTo("Mensaje de prueba")
        assertThat(captor.value.leida).isFalse()
        verify(fcm, never()).send(any())
    }

    @Test
    fun `enviar manda push a todos los tokens del usuario`() {
        val notifGuardada = makeNotif(6, "Con tokens")
        given(repo.save(any(Notificacion::class.java))).willReturn(notifGuardada)
        given(fcmTokenRepo.findByUsuarioId(usuarioConToken.id!!)).willReturn(listOf(
            fcmEntrada("tok-web", usuarioConToken, Plataforma.WEB),
            fcmEntrada("tok-android", usuarioConToken, Plataforma.ANDROID)
        ))

        notificacionService.enviar(usuarioConToken, "Con tokens", "Título")

        verify(repo).save(any(Notificacion::class.java))
        verify(fcm, org.mockito.Mockito.times(2)).send(any(Message::class.java))
    }

    @Test
    fun `enviar elimina token muerto cuando FCM responde UNREGISTERED`() {
        val notifGuardada = makeNotif(7, "Token muerto")
        val entradaMuerta = fcmEntrada("tok-dead", usuarioConToken, Plataforma.ANDROID)
        given(repo.save(any(Notificacion::class.java))).willReturn(notifGuardada)
        given(fcmTokenRepo.findByUsuarioId(usuarioConToken.id!!)).willReturn(listOf(entradaMuerta))

        val excepcionFcm = org.mockito.Mockito.mock(FirebaseMessagingException::class.java)
        given(excepcionFcm.messagingErrorCode).willReturn(MessagingErrorCode.UNREGISTERED)
        willThrow(excepcionFcm).given(fcm).send(any(Message::class.java))

        notificacionService.enviar(usuarioConToken, "Token muerto", "Título")

        verify(fcmTokenRepo).delete(entradaMuerta)
    }

    // ────────────────────────────────────────────────────────────────────
    // marcarLeida
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `marcarLeida cambia leida a true y guarda`() {
        val notif = makeNotif(10, "Notif sin leer", leida = false)
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(10)).willReturn(Optional.of(notif))
        given(repo.save(any(Notificacion::class.java))).willReturn(notif.copy(leida = true))

        val result = notificacionService.marcarLeida(10)

        verify(repo).save(any(Notificacion::class.java))
        assertThat(result.leida).isTrue()
    }

    @Test
    fun `marcarLeida lanza FORBIDDEN si la notificacion no pertenece al usuario`() {
        val otroUsuario = Usuario(id = 99, firebaseUid = "uid-99", email = "otro@test.com", nombre = "Otro", rol = rol)
        val notifAjena = Notificacion(id = 10, mensaje = "Ajena", usuario = otroUsuario, leida = false, fecha = LocalDateTime.now())

        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(10)).willReturn(Optional.of(notifAjena))

        val ex = assertThrows<ResponseStatusException> { notificacionService.marcarLeida(10) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).save(any())
    }

    @Test
    fun `marcarLeida lanza NOT_FOUND si la notificacion no existe`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { notificacionService.marcarLeida(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // marcarTodasLeidas
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `marcarTodasLeidas actualiza todas las notificaciones del usuario a leida true`() {
        val notifs = listOf(makeNotif(1, "A", leida = false), makeNotif(2, "B", leida = false))
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByUsuarioId(1)).willReturn(notifs)
        given(repo.saveAll(any<List<Notificacion>>())).willReturn(emptyList())

        notificacionService.marcarTodasLeidas()

        verify(repo).saveAll(any<List<Notificacion>>())
    }

    // ────────────────────────────────────────────────────────────────────
    // eliminar
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `eliminar borra la notificacion del propietario`() {
        val notif = makeNotif(10, "Para borrar")
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(10)).willReturn(Optional.of(notif))

        notificacionService.eliminar(10)

        verify(repo).deleteById(10)
    }

    @Test
    fun `eliminar lanza FORBIDDEN si la notificacion no pertenece al usuario`() {
        val otroUsuario = Usuario(id = 99, firebaseUid = "uid-99", email = "otro@test.com", nombre = "Otro", rol = rol)
        val notifAjena = Notificacion(id = 10, mensaje = "Ajena", usuario = otroUsuario, leida = false, fecha = LocalDateTime.now())

        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(10)).willReturn(Optional.of(notifAjena))

        val ex = assertThrows<ResponseStatusException> { notificacionService.eliminar(10) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).deleteById(anyInt())
    }
}
