package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.*
import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class TicketService(
    private val ticketRepo: TicketRepository,
    private val historicoRepo: TicketHistoricoRepository,
    private val comentarioRepo: TicketComentarioRepository,
    private val usuarioRepo: UsuarioRepository,
    private val notificacionRepository: NotificacionRepository,
    private val securityService: SecurityService,
    private val notificacionService: NotificacionService,
    private val auditoriaService: AuditoriaService // ✅ Inyectado
) {

    @Transactional(readOnly = true)
    fun listarMisTickets(): List<TicketDto> {
        val principal = securityService.getUserPrincipal()
        val userId = principal.userId ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        return ticketRepo.findByUsuarioId(userId).map { it.toDto() }
    }

    @Transactional(readOnly = true)
    fun listarTodos(): List<TicketDto> {
        val principal = securityService.getUserPrincipal()
        val esStaff = principal.authorities.any { it.authority == "ROLE_STAFF" || it.authority == "ROLE_ADMIN" }
        return if (esStaff) ticketRepo.findAll().map { it.toDto() } else listarMisTickets()
    }

    @Transactional
    fun crearTicket(dto: TicketCreateDto): TicketDto {
        val principal = securityService.getUserPrincipal()
        val userId = principal.userId ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        val usuario = usuarioRepo.findById(userId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }

        val nuevoTicket = Ticket(
            titulo = dto.titulo,
            descripcion = dto.descripcion,
            usuario = usuario,
            estado = TicketEstado.ABIERTO,
            prioridad = dto.prioridad ?: "MEDIA"
        )
        val ticketGuardado = ticketRepo.save(nuevoTicket)

        notificacionService.enviar(
            usuario = usuario,
            mensaje = "Se ha abierto correctamente tu ticket: ${dto.titulo}",
            titulo = "Ticket Creado ✅",
            data = mapOf("tipo" to "ticket", "url" to "/user-profile/tickets")
        )

        return ticketGuardado.toDto()
    }

    @Transactional
    fun actualizarTicket(id: Int, dto: TicketUpdateDto): TicketDto {
        val ticket = ticketRepo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        securityService.checkRole("STAFF", "ADMIN")

        val estadoAnterior = ticket.estado
        val nuevoEstado = dto.estado?.let {
            try { TicketEstado.valueOf(it) }
            catch (e: IllegalArgumentException) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido: $it")
            }
        } ?: ticket.estado

        val ticketActualizado = ticket.copy(
            titulo = dto.titulo ?: ticket.titulo,
            descripcion = dto.descripcion ?: ticket.descripcion,
            prioridad = dto.prioridad ?: ticket.prioridad,
            estado = nuevoEstado
        )
        val ticketGuardado = ticketRepo.save(ticketActualizado)

        if (estadoAnterior != nuevoEstado) {
            val principal = securityService.getUserPrincipal()
            val usuarioActor = usuarioRepo.findById(principal.userId!!).orElseThrow()

            historicoRepo.save(TicketHistorico(
                ticket = ticketGuardado,
                estadoAnterior = estadoAnterior.name,
                estadoNuevo = nuevoEstado.name,
                usuario = usuarioActor,
                comentario = "Actualización desde Panel de Administración"
            ))

            val codigoTicket = "TK-${ticket.id.toString().padStart(3, '0')}"

            auditoriaService.registrar(
                accion = "TICKET_ESTADO",
                recurso = "Ticket",
                descripcion = "Ticket $codigoTicket cambiado de ${estadoAnterior.name} a ${nuevoEstado.name} por Admin",
                severidad = "WARNING"
            )

            notificarCambioEstado(ticketGuardado, nuevoEstado.name)
        }

        return ticketGuardado.toDto()
    }

    @Transactional
    fun cambiarEstado(id: Int, nuevoEstado: String, comentario: String?): TicketDto {
        val ticket = ticketRepo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        val principal = securityService.getUserPrincipal()
        val usuarioActor = usuarioRepo.findById(principal.userId!!).orElseThrow()

        val estadoAnterior = ticket.estado

        if (nuevoEstado == "SOLICITUD_REAPERTURA") securityService.checkAccess(ticket.usuario.id)
        else securityService.checkRole("STAFF", "ADMIN")

        val nuevoEstadoEnum = try { TicketEstado.valueOf(nuevoEstado) }
            catch (e: IllegalArgumentException) { ticket.estado }
        val ticketActualizado = ticketRepo.save(ticket.copy(estado = nuevoEstadoEnum))

        historicoRepo.save(TicketHistorico(
            ticket = ticketActualizado,
            estadoAnterior = estadoAnterior.name,
            estadoNuevo = nuevoEstado,
            usuario = usuarioActor,
            comentario = comentario
        ))

        if (!comentario.isNullOrBlank()) {
            val textoMensaje = if (nuevoEstado == "SOLICITUD_REAPERTURA")
                "🔄 SOLICITUD REAPERTURA: $comentario"
            else
                "Cambio de estado a $nuevoEstado: $comentario"

            comentarioRepo.save(TicketComentario(ticket = ticketActualizado, autor = usuarioActor, texto = textoMensaje))
        }

        // ✅ LOG con severidad dinámica
        val severidad = if (nuevoEstado == "SOLICITUD_REAPERTURA") "WARNING" else "INFO"
        auditoriaService.registrar(
            accion = "TICKET_CAMBIO",
            recurso = "Ticket",
            descripcion = "Estado cambiado a $nuevoEstado. Comentario: ${comentario?.take(50)}...",
            severidad = severidad
        )

        notificarCambioEstado(ticketActualizado, nuevoEstado)

        return ticketActualizado.toDto()
    }

    private fun notificarCambioEstado(ticket: Ticket, nuevoEstado: String) {
        val tieneNotifPendiente = notificacionRepository.findByUsuarioId(ticket.usuario.id!!)
            .any { !it.leida && it.mensaje.contains("ticket", ignoreCase = true) }

        if (!tieneNotifPendiente) {
            notificacionService.enviar(
                usuario = ticket.usuario,
                mensaje = "Tu ticket TK-${ticket.id.toString().padStart(3, '0')} ahora está: $nuevoEstado",
                titulo = "Actualización de Ticket",
                data = mapOf("tipo" to "ticket", "url" to "/user-profile/tickets")
            )
        }
    }

    @Transactional(readOnly = true)
    fun listarComentarios(ticketId: Int): List<TicketComentarioDto> {
        val ticket = ticketRepo.findById(ticketId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        if (ticket.usuario.id != securityService.getUserPrincipal().userId) {
            securityService.checkRole("STAFF", "ADMIN")
        }
        return comentarioRepo.findAllByTicketIdOrderByFechaEnvioAsc(ticketId).map { it.toDto() }
    }

    @Transactional
    fun enviarComentario(ticketId: Int, dto: TicketComentarioCreateDto): TicketComentarioDto {
        val ticket = ticketRepo.findById(ticketId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        if (ticket.usuario.id != securityService.getUserPrincipal().userId) {
            securityService.checkRole("STAFF", "ADMIN")
        }
        val autor = usuarioRepo.findById(securityService.getUserPrincipal().userId!!).orElseThrow()
        return comentarioRepo.save(TicketComentario(ticket = ticket, autor = autor, texto = dto.texto)).toDto()
    }

    @Transactional(readOnly = true)
    fun listarHistorico(ticketId: Int): List<TicketHistoricoDto> {
        val ticket = ticketRepo.findById(ticketId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        securityService.checkAccess(ticket.usuario.id, "STAFF", "ADMIN")
        return historicoRepo.findAllByTicketIdOrderByFecha(ticketId).map {
            TicketHistoricoDto(it.id, it.estadoAnterior, it.estadoNuevo, it.usuario.nombre, it.comentario, it.fecha)
        }
    }

    private fun Ticket.toDto() = TicketDto(
        id = this.id ?: 0,
        codigo = "TK-${(this.id ?: 0).toString().padStart(3, '0')}",
        titulo = this.titulo,
        descripcion = this.descripcion,
        estado = this.estado.name,
        prioridad = this.prioridad,
        fechaCreacion = this.fechaCreacion,
        usuarioNombre = this.usuario.nombre
    )

    private fun TicketComentario.toDto() = TicketComentarioDto(this.id!!, this.texto, this.autor.nombre, this.autor.rol.nombre != "USER", this.fechaEnvio)
}