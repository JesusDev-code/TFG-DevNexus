package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.EventoCreateDto
import com.example.SpringBoot.TFG.dto.EventoDto
import com.example.SpringBoot.TFG.dto.UsuarioResumenDto
import com.example.SpringBoot.TFG.model.Evento
import com.example.SpringBoot.TFG.model.EventoVisibilidad
import com.example.SpringBoot.TFG.repository.EventoRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit

@Service
class EventoService(
    private val repo: EventoRepository,
    private val usuarioRepo: UsuarioRepository,
    private val notificacionService: NotificacionService,
    private val securityService: SecurityService,
    private val auditoriaService: AuditoriaService
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun crearEventoSeguro(dto: EventoCreateDto): EventoDto {
        val principal = securityService.getUserPrincipal()
        val userId = principal.userId!!
        val esAdminStaff = securityService.hasRole("ADMIN", "STAFF")

        val visibilidadFinal = if (dto.visibilidad == EventoVisibilidad.PUBLICO && !esAdminStaff) {
            EventoVisibilidad.PRIVADO
        } else {
            dto.visibilidad
        }

        val creador = usuarioRepo.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado")
        }

        val evento = Evento(
            titulo = dto.titulo,
            descripcion = dto.descripcion,
            fechaEvento = dto.fechaEvento,
            horaEvento = dto.horaEvento,
            visibilidad = visibilidadFinal,
            usuario = creador
        )

        val guardado = repo.save(evento)

        if (guardado.visibilidad == EventoVisibilidad.PUBLICO) {
            // ✅ LOG: Evento Público (Importante)
            auditoriaService.registrar(
                accion = "EVENTO_PUBLICO",
                recurso = "Evento",
                descripcion = "Evento global creado: ${guardado.titulo}",
                severidad = "INFO"
            )

            var pageNum = 0
            var page = usuarioRepo.findAll(PageRequest.of(pageNum++, 100))
            do {
                page.content.forEach { u ->
                    notificacionService.enviar(
                        usuario = u,
                        titulo = "Nuevo Evento Oficial",
                        mensaje = "${guardado.titulo} el ${guardado.fechaEvento}",
                        data = mapOf("tipo" to "evento", "url" to "/user-profile/eventos")
                    )
                }
                if (page.hasNext()) page = usuarioRepo.findAll(PageRequest.of(pageNum++, 100))
            } while (page.hasNext())
        }
        return guardado.toDto()
    }

    @Transactional
    fun eliminarEventoSeguro(id: Int) {
        val evento = repo.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado")
        }

        val esAdmin = securityService.hasRole("ADMIN")
        val esDueno = (evento.usuario.id == securityService.getUserPrincipal().userId)

        if (esAdmin || (esDueno && evento.visibilidad == EventoVisibilidad.PRIVADO)) {
            repo.deleteById(id)

            // ✅ LOG: Borrado si es Admin (para seguimiento)
            if (esAdmin) {
                auditoriaService.registrar(
                    accion = "EVENTO_ELIMINADO",
                    recurso = "Evento",
                    descripcion = "Evento '${evento.titulo}' eliminado por Admin",
                    severidad = "WARNING"
                )
            }
        } else {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar este evento")
        }
    }

    @Transactional(readOnly = true)
    fun listarSeguro(): List<EventoDto> {
        val principal = securityService.getUserPrincipal()
        val esAdminStaff = securityService.hasRole("ADMIN", "STAFF")
        val userId = principal.userId!!

        val lista = if (esAdminStaff) {
            repo.findAll()
        } else {
            repo.findPublicosOrByUsuarioId(userId)
        }
        return lista.map { it.toDto() }
    }

    // --- TAREAS AUTOMÁTICAS (Scheduled) ---
    @Scheduled(cron = "0 0 0 * * *", zone = "Europe/Madrid")
    @Transactional
    fun limpiezaDiaria() {
        val zona = ZoneId.of("Europe/Madrid")
        val hoy = LocalDate.now(zona)
        repo.deleteByFechaEventoBefore(hoy)
    }

    @Scheduled(cron = "0 0 9 * * *", zone = "Europe/Madrid")
    @Transactional
    fun avisoDiaAntes() {
        val zona = ZoneId.of("Europe/Madrid")
        val mañana = LocalDate.now(zona).plusDays(1)
        repo.findByFechaEvento(mañana).forEach { ev ->
            enviarAInteresados(ev, "Recordatorio: Mañana tienes: ${ev.titulo}")
        }
    }

    @Scheduled(cron = "0 * * * * *", zone = "Europe/Madrid")
    @Transactional
    fun avisoDiezMinutos() {
        val zona = ZoneId.of("Europe/Madrid")
        val ahoraEnEspana = ZonedDateTime.now(zona)
        val fechaHoy = ahoraEnEspana.toLocalDate()
        val enDiezMin = ahoraEnEspana.toLocalTime().plusMinutes(10).truncatedTo(ChronoUnit.MINUTES)

        repo.findByFechaEvento(fechaHoy)
            .forEach { ev ->
                if (ev.horaEvento.truncatedTo(ChronoUnit.MINUTES) == enDiezMin) {
                    enviarAInteresados(ev, "¡Empieza en 10 min!: ${ev.titulo}")
                }
            }
    }

    private fun enviarAInteresados(ev: Evento, msg: String) {
        val datosNav = mapOf("tipo" to "evento", "url" to "/user-profile/eventos")
        if (ev.visibilidad == EventoVisibilidad.PUBLICO) {
            var pageNum = 0
            var page = usuarioRepo.findAll(PageRequest.of(pageNum++, 100))
            do {
                page.content.forEach { notificacionService.enviar(it, msg, "Recordatorio Evento", datosNav) }
                if (page.hasNext()) page = usuarioRepo.findAll(PageRequest.of(pageNum++, 100))
            } while (page.hasNext())
        } else {
            notificacionService.enviar(ev.usuario, msg, "Recordatorio Evento", datosNav)
        }
    }

    private fun Evento.toDto() = EventoDto(
        id = this.id ?: 0,
        titulo = this.titulo,
        descripcion = this.descripcion,
        fechaEvento = this.fechaEvento,
        horaEvento = this.horaEvento,
        visibilidad = this.visibilidad,
        usuario = UsuarioResumenDto(this.usuario.id ?: 0, this.usuario.nombre ?: "Desconocido")
    )
}