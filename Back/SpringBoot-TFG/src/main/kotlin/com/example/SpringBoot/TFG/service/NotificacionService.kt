package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.NotificacionDto
import com.example.SpringBoot.TFG.model.Notificacion
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.repository.NotificacionRepository
import com.example.SpringBoot.TFG.repository.UsuarioFcmTokenRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingException
import com.google.firebase.messaging.Message
import com.google.firebase.messaging.MessagingErrorCode
import com.google.firebase.messaging.Notification as FcmNotification
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@Service
class NotificacionService(
    private val repo: NotificacionRepository,
    private val usuarioRepo: UsuarioRepository,
    private val fcmTokenRepo: UsuarioFcmTokenRepository,
    private val securityService: SecurityService,
    private val fcm: FirebaseMessaging
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    private val tokensMuertos = setOf(
        MessagingErrorCode.UNREGISTERED,
        MessagingErrorCode.INVALID_ARGUMENT,
        MessagingErrorCode.SENDER_ID_MISMATCH
    )

    @Transactional(readOnly = true)
    fun listarMisNotificaciones(): List<NotificacionDto> {
        val userId = securityService.getUserPrincipal().userId!!
        return repo.findByUsuarioId(userId)
            .sortedByDescending { it.fecha }
            .map { it.toDto() }
    }

    @Transactional
    fun enviar(
        usuario: Usuario,
        mensaje: String,
        titulo: String = "Aviso del Sistema",
        data: Map<String, String> = emptyMap()
    ) {
        val notif = Notificacion(
            mensaje = mensaje,
            usuario = usuario,
            leida = false,
            fecha = LocalDateTime.now()
        )
        repo.save(notif)

        val tokens = fcmTokenRepo.findByUsuarioId(usuario.id!!)
        if (tokens.isEmpty()) {
            logger.debug("Usuario {} sin tokens FCM, push omitido", usuario.email)
            return
        }

        tokens.forEach { entrada ->
            try {
                val builder = Message.builder()
                    .setToken(entrada.token)
                    .setNotification(
                        FcmNotification.builder()
                            .setTitle(titulo)
                            .setBody(mensaje)
                            .build()
                    )
                if (data.isNotEmpty()) builder.putAllData(data)
                fcm.send(builder.build())
                entrada.fechaUso = LocalDateTime.now()
                fcmTokenRepo.save(entrada)
                logger.info("Push enviado a {} ({}, {})", usuario.nombre, titulo, entrada.plataforma)
            } catch (e: FirebaseMessagingException) {
                if (e.messagingErrorCode in tokensMuertos) {
                    logger.warn("Token FCM muerto eliminado: user={} plataforma={} code={}", usuario.email, entrada.plataforma, e.messagingErrorCode)
                    fcmTokenRepo.delete(entrada)
                } else {
                    logger.error("Error FCM enviando a {} ({}): code={} msg={}", usuario.nombre, entrada.plataforma, e.messagingErrorCode, e.message)
                }
            } catch (e: Exception) {
                logger.error("Excepción inesperada enviando FCM a {} token=[{}]: {}", usuario.nombre, entrada.token.take(20), e.message, e)
            }
        }
    }

    fun testPush(): String {
        val userId = securityService.getUserPrincipal().userId!!
        val usuario = usuarioRepo.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }

        val tokens = fcmTokenRepo.findByUsuarioId(userId)
        if (tokens.isEmpty()) return "Sin tokens FCM — el usuario no tiene tokens registrados"

        val resultados = tokens.map { entrada ->
            try {
                val msg = Message.builder()
                    .setToken(entrada.token)
                    .setNotification(FcmNotification.builder().setTitle("Test Push").setBody("Si ves esto, FCM funciona").build())
                    .putData("tipo", "evento")
                    .putData("url", "/user-profile/eventos")
                    .build()
                fcm.send(msg)
                "OK ${entrada.plataforma}"
            } catch (e: FirebaseMessagingException) {
                if (e.messagingErrorCode in tokensMuertos) fcmTokenRepo.delete(entrada)
                "FALLO ${entrada.plataforma}: ${e.messagingErrorCode}"
            } catch (e: Exception) {
                "ERROR ${entrada.plataforma}: ${e.message}"
            }
        }

        return "Usuario ${usuario.email} — ${resultados.joinToString(" | ")}"
    }

    @Transactional
    fun marcarLeida(id: Int): NotificacionDto {
        val userId = securityService.getUserPrincipal().userId!!
        val notif = repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        if (notif.usuario.id != userId) throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return repo.save(notif.copy(leida = true)).toDto()
    }

    @Transactional
    fun marcarTodasLeidas() {
        val userId = securityService.getUserPrincipal().userId!!
        val lista = repo.findByUsuarioId(userId)
        repo.saveAll(lista.map { it.copy(leida = true) })
    }

    @Transactional
    fun eliminar(id: Int) {
        val userId = securityService.getUserPrincipal().userId!!
        val notif = repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        if (notif.usuario.id != userId) throw ResponseStatusException(HttpStatus.FORBIDDEN)
        repo.deleteById(id)
    }

    private fun Notificacion.toDto() = NotificacionDto(
        id = this.id ?: 0,
        mensaje = this.mensaje,
        fecha = this.fecha,
        leida = this.leida
    )
}
