package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.InvitacionPendienteDto
import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class DiarioColaboracionService(
    private val colaboracionRepo: DiarioColaboracionRepository,
    private val diarioTemaRepo: DiarioTemaRepository,
    private val usuarioRepo: UsuarioRepository,
    private val securityService: SecurityService
) {

    // 1. Enviar Invitación
    fun invitarUsuario(temaId: Int, emailInvitado: String) {
        val currentUser = securityService.getUserPrincipal()

        // Buscamos el tema
        val tema = diarioTemaRepo.findById(temaId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }

        if (tema.usuario.id != currentUser.userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el dueño puede invitar colaboradores")
        }

        // Buscamos al usuario a invitar
        // SOLUCIÓN ERROR IMAGEN 1: Esto funcionará cuando actualices UsuarioRepository abajo
        val invitado = usuarioRepo.findByEmail(emailInvitado)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario con email $emailInvitado no encontrado") }

        // Evitar duplicados
        if (colaboracionRepo.existsByTemaIdAndUsuarioId(temaId, invitado.id!!)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario ya está invitado o colaborando")
        }

        val invitacion = DiarioColaboracion(
            tema = tema,
            usuario = invitado,
            estado = InvitacionEstado.PENDIENTE
        )
        colaboracionRepo.save(invitacion)
    }

    // 2. Aceptar/Rechazar Invitación
    fun responderInvitacion(invitacionId: Long, aceptar: Boolean) {
        val currentUser = securityService.getUserPrincipal()

        val invitacion = colaboracionRepo.findById(invitacionId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Invitación no encontrada") }

        if (invitacion.usuario.id != currentUser.userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Esta invitación no es para ti")
        }

        if (aceptar) {
            invitacion.estado = InvitacionEstado.ACEPTADA
            colaboracionRepo.save(invitacion)
        } else {
            colaboracionRepo.delete(invitacion)
        }
    }

    // 3. Ver mis invitaciones pendientes
    @Transactional(readOnly = true)
    fun misInvitacionesPendientes(): List<InvitacionPendienteDto> {
        val currentUser = securityService.getUserPrincipal()

        return colaboracionRepo.findByUsuarioIdAndEstado(currentUser.userId!!, InvitacionEstado.PENDIENTE)
            .map {
                InvitacionPendienteDto(
                    id = it.id!!,
                    // SOLUCIÓN ERROR IMAGEN 3 (Type Mismatch): Añadimos ?: "Sin título"
                    temaTitulo = it.tema.titulo ?: "Proyecto sin nombre",
                    // Aseguramos también el nombre del dueño por si acaso
                    ownerNombre = it.tema.usuario?.nombre ?: "Admin",
                    fecha = it.fechaInvitacion.toString()
                )
            }
    }
}