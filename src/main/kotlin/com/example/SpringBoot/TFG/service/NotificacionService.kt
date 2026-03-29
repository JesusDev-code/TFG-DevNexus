package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.NotificacionDto
import com.example.SpringBoot.TFG.model.Notificacion
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.repository.NotificacionRepository
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.Message
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
    private val securityService: SecurityService,
    private val fcm: FirebaseMessaging
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    fun listarMisNotificaciones(): List<NotificacionDto> {
        val userId = securityService.getUserPrincipal().userId!!
        return repo.findByUsuarioId(userId)
            .sortedByDescending { it.fecha }
            .map { it.toDto() }
    }

    /**
     * ✅ MÉTODO ACTUALIZADO: Ahora acepta Título y Datos de Navegación.
     */
    @Transactional
    fun enviar(
        usuario: Usuario,
        mensaje: String,
        titulo: String = "Aviso del Sistema",
        data: Map<String, String> = emptyMap()
    ) {
        // 1. Guardar siempre en la DB para el historial visual de la campana
        val notif = Notificacion(
            mensaje = mensaje,
            usuario = usuario,
            leida = false,
            fecha = LocalDateTime.now()
        )
        repo.save(notif)

        // 2. Intentar enviar el Push al móvil/navegador
        usuario.fcmToken?.let { token ->
            try {
                val messageBuilder = Message.builder()
                    .setToken(token)
                    .setNotification(
                        FcmNotification.builder()
                            .setTitle(titulo)
                            .setBody(mensaje)
                            .build()
                    )

                // ✅ Metemos los datos extra (tipo, id, url) para el frontend
                if (data.isNotEmpty()) {
                    messageBuilder.putAllData(data)
                }

                fcm.send(messageBuilder.build())
                logger.info("Push enviado con éxito a {} ({})", usuario.nombre, titulo)
            } catch (e: Exception) {
                logger.warn("Error enviando Push a {}: {}", usuario.nombre, e.message, e)
            }
        }
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