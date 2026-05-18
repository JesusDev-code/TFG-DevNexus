package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.MensajeDto
import com.example.SpringBoot.TFG.dto.MensajeCreateDto
import com.example.SpringBoot.TFG.model.ConversacionParticipanteId
import com.example.SpringBoot.TFG.model.Mensaje
import com.example.SpringBoot.TFG.repository.*
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import org.slf4j.LoggerFactory

@Service
class MensajeService(
    private val repo: MensajeRepository,
    private val conversacionRepo: ConversacionRepository,
    private val participanteRepo: ConversacionParticipanteRepository,
    private val usuarioRepo: UsuarioRepository,
    private val securityService: SecurityService,
    private val notificacionService: NotificacionService
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun marcarComoLeidos(convId: Int) {
        val userId = securityService.getUserPrincipal().userId!!
        val pendientes = repo.findByConversacionIdAndAutorIdNotAndLeidoEnIsNull(convId, userId)
        pendientes.forEach { it.leidoEn = LocalDateTime.now() }
        repo.saveAll(pendientes)
    }

    @Transactional(readOnly = true)
    fun obtenerMensajes(convId: Int): List<MensajeDto> {
        val principal = securityService.getUserPrincipal()
        val userId = principal.userId!!

        if (!participanteRepo.existsById(ConversacionParticipanteId(convId, userId)) &&
            !principal.authorities.any { it.authority == "ROLE_ADMIN" }) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta conversación")
        }

        return repo.findByConversacionIdOrderByFechaEnvioDesc(convId, Pageable.unpaged()).content
            .reversed()
            .map { it.toDto() }
    }

    /**
     * ✅ FUNCIÓN MODIFICADA CON LÓGICA ANTI-SPAM Y NAVEGACIÓN
     */
    @Transactional
    fun enviarMensaje(dto: MensajeCreateDto): MensajeDto {
        val principal = securityService.getUserPrincipal()
        val autorId = principal.userId!!
        val autor = usuarioRepo.findById(autorId).orElseThrow()
        val conv = conversacionRepo.findById(dto.conversacionId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Conversación no encontrada")
        }

        val esAdmin = principal.authorities.any { it.authority == "ROLE_ADMIN" }
        if (!esAdmin && !participanteRepo.existsById(ConversacionParticipanteId(conv.id!!, autorId))) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta conversación")
        }

        val nuevoMensaje = Mensaje(
            conversacion = conv,
            autor = autor,
            texto = dto.texto
        )
        val guardado = repo.save(nuevoMensaje)

        // ✅ LÓGICA DE NOTIFICACIÓN INTELIGENTE
        val receptor = conv.participantes.firstOrNull { it.usuario.id != autorId }?.usuario

        if (receptor != null) {
            // 1. Usamos tu sistema de "mensajes no leídos"
            // Contamos cuántos mensajes tiene sin leer el receptor en ESTA conversación
            val noLeidos = repo.countUnreadMessages(conv.id!!, receptor.id!!)

            // 2. Solo disparamos el PUSH si es el PRIMER mensaje sin leer (noLeidos == 1)
            if (noLeidos <= 1) {
                // Preparamos los datos de navegación para el Frontend
                val datosNavegacion = mapOf(
                    "tipo" to "mensaje",
                    "id" to conv.id.toString(),
                    "url" to "/user-profile/mensajes/\${conv.id}" // Ruta directa al chat
                )

                notificacionService.enviar(
                    usuario = receptor,
                    mensaje = "Tienes un nuevo mensaje de ${autor.nombre}",
                    titulo = "Nuevo Mensaje", // Asegúrate de que tu NotificacionService acepte título y data
                    data = datosNavegacion
                )
            } else {
                logger.info("Silenciando Push: receptor ya tiene avisos pendientes en conversacion {}", conv.id)
            }
        }

        return guardado.toDto()
    }

    private fun Mensaje.toDto() = MensajeDto(
        id = this.id!!,
        texto = this.texto,
        autorId = this.autor.id!!,
        autorNombre = this.autor.nombre,
        autorFoto = this.autor.foto_perfil,
        fechaEnvio = this.fechaEnvio,
        esStaff = this.autor.rol.nombre == "ADMIN" || this.autor.rol.nombre == "STAFF",
        leido = this.leidoEn != null
    )
}