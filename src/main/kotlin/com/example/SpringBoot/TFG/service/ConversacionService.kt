package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.ConversacionDto
import com.example.SpringBoot.TFG.dto.ConversacionCreateDto
import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class ConversacionService(
    private val repo: ConversacionRepository,
    private val mensajeRepo: MensajeRepository,
    private val participanteRepo: ConversacionParticipanteRepository,
    private val usuarioRepo: UsuarioRepository,
    private val securityService: SecurityService
) {

    /**
     * Obtiene la lista de chats donde el usuario actual participa.
     */
    @Transactional(readOnly = true)
    fun listarMisConversaciones(): List<ConversacionDto> {
        val principal = securityService.getUserPrincipal()
        val userId = principal.userId ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no identificado")

        val conversadas = repo.findByParticipanteId(userId)

        return conversadas.mapNotNull { conv ->
            val convId = conv.id ?: return@mapNotNull null

            // Conteo de mensajes no leídos de forma segura
            val unread = try {
                mensajeRepo.countUnreadMessages(convId, userId)
            } catch (e: Exception) { 0L }

            var tituloFinal = conv.titulo ?: "Chat"
            var avatarFinal: String? = null
            var esAdminChat = false

            // Si es individual, buscamos al OTRO participante para sacar sus datos y Rol
            if (conv.tipo == ConversacionTipo.individual) {
                val otro = conv.participantes.firstOrNull { it.usuario.id != userId }
                if (otro != null) {
                    tituloFinal = otro.usuario.nombre
                    avatarFinal = otro.usuario.foto_perfil

                    // ✅ DETECTAR SI ES ADMIN O STAFF
                    val rol = otro.usuario.rol.nombre
                    esAdminChat = rol == "ADMIN" || rol == "STAFF"
                }
            }

            ConversacionDto(
                id = convId,
                titulo = tituloFinal,
                tipo = conv.tipo.name,
                ultimoMensaje = null, // Se podría rellenar con query extra si fuera necesario
                fechaUltimoMensaje = conv.fechaCreacion,
                unreadCount = unread,
                avatarUrl = avatarFinal,
                esAdmin = esAdminChat // ✅ Asignamos el valor calculado
            )
        }
    }

    /**
     * Crea un nuevo chat o devuelve uno existente si es individual.
     */
    @Transactional
    fun crearOObtenerConversacion(dto: ConversacionCreateDto): ConversacionDto {
        val principal = securityService.getUserPrincipal()
        val userId = principal.userId!!
        val emisor = usuarioRepo.findById(userId).orElseThrow()

        // 1. Intentar recuperar chat existente (Solo Individual)
        if (dto.tipo.lowercase() == "individual" && dto.invitadoId != null) {
            val existente = repo.findIndividualChatBetween(userId, dto.invitadoId)
            if (existente != null) {
                val otro = usuarioRepo.findById(dto.invitadoId).get()
                val unread = try { mensajeRepo.countUnreadMessages(existente.id!!, userId) } catch (e: Exception) { 0L }

                // Calculamos si el otro es admin
                val esAdminChat = otro.rol.nombre == "ADMIN" || otro.rol.nombre == "STAFF"

                return ConversacionDto(
                    id = existente.id!!,
                    titulo = otro.nombre,
                    tipo = existente.tipo.name,
                    ultimoMensaje = null,
                    fechaUltimoMensaje = existente.fechaCreacion,
                    unreadCount = unread,
                    avatarUrl = otro.foto_perfil,
                    esAdmin = esAdminChat // ✅
                )
            }
        }

        // 2. Crear nueva conversación
        val nueva = repo.save(Conversacion(
            titulo = dto.titulo,
            tipo = ConversacionTipo.valueOf(dto.tipo.lowercase()),
            creadoPor = emisor
        ))

        // El creador es el primer participante
        participanteRepo.save(ConversacionParticipante(ConversacionParticipanteId(nueva.id!!, userId), nueva, emisor))

        var tituloRes = nueva.titulo ?: "Chat"
        var avatarRes: String? = null
        var esAdminChat = false

        // Si se invita a alguien en la creación
        if (dto.invitadoId != null) {
            val invitado = usuarioRepo.findById(dto.invitadoId).orElseThrow()
            participanteRepo.save(ConversacionParticipante(ConversacionParticipanteId(nueva.id!!, dto.invitadoId), nueva, invitado))

            tituloRes = invitado.nombre
            avatarRes = invitado.foto_perfil

            // Calculamos si el invitado es admin
            esAdminChat = invitado.rol.nombre == "ADMIN" || invitado.rol.nombre == "STAFF"
        }

        return ConversacionDto(
            id = nueva.id!!,
            titulo = tituloRes,
            tipo = nueva.tipo.name,
            ultimoMensaje = null,
            fechaUltimoMensaje = nueva.fechaCreacion,
            unreadCount = 0,
            avatarUrl = avatarRes,
            esAdmin = esAdminChat // ✅
        )
    }

    /**
     * Elimina una conversación completa.
     */
    @Transactional
    fun eliminarConversacion(id: Int) {
        val principal = securityService.getUserPrincipal()
        val conv = repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }

        // Seguridad: Solo el dueño o un ADMIN
        if (conv.creadoPor.id != principal.userId && !principal.authorities.any { it.authority == "ROLE_ADMIN" }) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para borrar esta conversación")
        }
        repo.deleteById(id)
    }

    /**
     * Añade un participante a un grupo existente.
     */
    @Transactional
    fun añadirParticipante(cp: ConversacionParticipante): ConversacionParticipante {
        val principal = securityService.getUserPrincipal()
        val userId = principal.userId ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

        val convId = cp.conversacion.id ?: cp.id.conversacionId
        if (convId == 0) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "ID conversación requerido")

        val conversacion = repo.findById(convId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Conversación no encontrada")
        }

        val esAdmin = principal.authorities.any { it.authority == "ROLE_ADMIN" }
        if (conversacion.creadoPor.id != userId && !esAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para añadir participantes")
        }

        val targetUserId = cp.usuario.id ?: cp.id.usuarioId
        if (targetUserId == 0) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "ID usuario destino requerido")

        val usuarioInvitado = usuarioRepo.findById(targetUserId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado")
        }

        val nuevoParticipante = ConversacionParticipante(
            id = ConversacionParticipanteId(convId, targetUserId),
            conversacion = conversacion,
            usuario = usuarioInvitado
        )

        return participanteRepo.save(nuevoParticipante)
    }

    /**
     * Elimina un participante (salirse o ser expulsado).
     */
    @Transactional
    fun eliminarParticipante(convId: Int, targetUserId: Int) {
        val principal = securityService.getUserPrincipal()
        val currentUserId = principal.userId!!

        val id = ConversacionParticipanteId(convId, targetUserId)
        if (!participanteRepo.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participante no encontrado")
        }

        val conversacion = repo.findById(convId).orElseThrow()

        val esAdmin = principal.authorities.any { it.authority == "ROLE_ADMIN" }
        if (targetUserId != currentUserId && conversacion.creadoPor.id != currentUserId && !esAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar a este participante")
        }

        participanteRepo.deleteById(id)
    }
}