package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.DiarioTemaCreateDto
import com.example.SpringBoot.TFG.dto.DiarioTemaDto
import com.example.SpringBoot.TFG.dto.InvitarUsuarioDto
import com.example.SpringBoot.TFG.dto.InvitacionPendienteDto
import com.example.SpringBoot.TFG.service.DiarioTemaService
import com.example.SpringBoot.TFG.service.DiarioColaboracionService // ✅ Servicio Nuevo
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/diario-temas")
class DiarioTemaController(
    private val service: DiarioTemaService,
    private val colaboracionService: DiarioColaboracionService // ✅ Inyectado
) {

    @GetMapping
    fun list(): List<DiarioTemaDto> = service.listMisTemas()

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

    @GetMapping("/invitaciones/pendientes")
    fun listarPendientes(): List<InvitacionPendienteDto> {
        return colaboracionService.misInvitacionesPendientes()
    }
}