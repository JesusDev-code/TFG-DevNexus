package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.ComentarioCreateDto
import com.example.SpringBoot.TFG.dto.DiarioComentarioDto
import com.example.SpringBoot.TFG.dto.DiarioTemaCreateDto
import com.example.SpringBoot.TFG.dto.DiarioTemaDto
import com.example.SpringBoot.TFG.dto.ColaboradorDto
import com.example.SpringBoot.TFG.dto.InvitarUsuarioDto
import com.example.SpringBoot.TFG.dto.InvitacionPendienteDto
import com.example.SpringBoot.TFG.dto.DiarioTemaUpdateDto
import com.example.SpringBoot.TFG.dto.VisibilidadUpdateDto
import com.example.SpringBoot.TFG.model.Visibilidad
import com.example.SpringBoot.TFG.service.DiarioTemaService
import com.example.SpringBoot.TFG.service.DiarioColaboracionService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/diario-temas")
class DiarioTemaController(
    private val service: DiarioTemaService,
    private val colaboracionService: DiarioColaboracionService // ✅ Inyectado
) {

    @GetMapping
    fun list(): List<DiarioTemaDto> = service.listMisTemas()

    @GetMapping("/publicos")
    fun listPublicos(): List<DiarioTemaDto> = service.listTemaPublicos()

    @GetMapping("/usuario/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    fun listByUserId(@PathVariable userId: Int): List<DiarioTemaDto> =
        service.listTemasByUserId(userId)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody dto: DiarioTemaCreateDto): DiarioTemaDto = service.create(dto)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): DiarioTemaDto = service.getById(id)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Int) = service.delete(id)

    // ==========================================
    // ✅ NUEVOS ENDPOINTS DE COLABORACIÓN
    // ==========================================

    @PostMapping("/{id}/invitar")
    @ResponseStatus(HttpStatus.OK)
    fun invitar(@PathVariable id: Int, @RequestBody body: InvitarUsuarioDto) {
        colaboracionService.invitarUsuario(id, body.email)
    }

    @PostMapping("/invitaciones/{invitacionId}/responder")
    @ResponseStatus(HttpStatus.OK)
    fun responder(@PathVariable invitacionId: Long, @RequestParam aceptar: Boolean) {
        colaboracionService.responderInvitacion(invitacionId, aceptar)
    }

    @GetMapping("/{id}/colaboradores")
    @Transactional(readOnly = true)
    fun getColaboradores(@PathVariable id: Int): List<ColaboradorDto> {
        return colaboracionService.getColaboradoresDeTema(id)
    }

    @GetMapping("/invitaciones/pendientes")
    fun listarPendientes(): List<InvitacionPendienteDto> {
        return colaboracionService.misInvitacionesPendientes()
    }

    @PatchMapping("/{id}")
    fun actualizarTema(@PathVariable id: Int, @RequestBody body: DiarioTemaUpdateDto): DiarioTemaDto {
        return service.actualizarTema(id, body.titulo, body.descripcion)
    }

    @PatchMapping("/{id}/visibilidad")
    fun cambiarVisibilidad(@PathVariable id: Int, @RequestBody body: VisibilidadUpdateDto): DiarioTemaDto {
        return service.cambiarVisibilidad(
            id,
            Visibilidad.valueOf(body.visibilidad),
            body.tituloPublicacion,
            body.descripcionPublicacion
        )
    }

    // Staff reviews (privados)
    @GetMapping("/{temaId}/comentarios")
    fun getComentariosTema(@PathVariable temaId: Int): List<DiarioComentarioDto> =
        service.listarComentariosTema(temaId)

    @PostMapping("/{temaId}/comentarios")
    @ResponseStatus(HttpStatus.CREATED)
    fun agregarComentarioTema(
        @PathVariable temaId: Int,
        @RequestBody body: ComentarioCreateDto
    ): DiarioComentarioDto = service.comentarTema(temaId, body.texto)

    // Comentarios de comunidad (blog público)
    @GetMapping("/{temaId}/comentarios/comunidad")
    fun getComentariosComunidad(@PathVariable temaId: Int): List<DiarioComentarioDto> =
        service.listarComentariosComunidad(temaId)

    @PostMapping("/{temaId}/comentarios/comunidad")
    @ResponseStatus(HttpStatus.CREATED)
    fun agregarComentarioComunidad(
        @PathVariable temaId: Int,
        @RequestBody body: ComentarioCreateDto
    ): DiarioComentarioDto = service.comentarComunidad(temaId, body.texto)
}