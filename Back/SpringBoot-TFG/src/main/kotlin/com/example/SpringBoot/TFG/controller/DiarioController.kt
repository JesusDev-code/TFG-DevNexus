package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.ComentarioCreateDto
import com.example.SpringBoot.TFG.dto.DiarioComentarioDto
import com.example.SpringBoot.TFG.dto.DiarioCreateDto
import com.example.SpringBoot.TFG.dto.DiarioDto
import com.example.SpringBoot.TFG.security.UserPrincipal
import com.example.SpringBoot.TFG.service.DiarioService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/diarios")
class DiarioController(
    private val service: DiarioService
) {

    @GetMapping
    fun list(pageable: Pageable, authentication: Authentication): Page<DiarioDto> {
        val principal = authentication.principal as UserPrincipal
        if (principal.authorities.any { it.authority == "ROLE_STAFF" || it.authority == "ROLE_ADMIN" }) {
            return service.listAll(pageable)
        }
        return service.publicos(pageable)
    }

    @GetMapping("/usuario/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    fun listarPorUsuarioId(
        @PathVariable userId: Int,
        pageable: Pageable
    ): Page<DiarioDto> {
        return service.listByUserId(userId, pageable)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int, authentication: Authentication): DiarioDto {
        val dto = service.getById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Diario no encontrado")

        if (dto.visibilidad == "PRIVADO") {
            val principal = authentication.principal as UserPrincipal
            val esAdminOrStaff = principal.authorities.any {
                it.authority == "ROLE_STAFF" || it.authority == "ROLE_ADMIN"
            }
            if (dto.usuarioId != principal.userId && !esAdminOrStaff) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado")
            }
        }
        return dto
    }

    // ✅ NUEVO: Obtener comentarios de un diario
    @GetMapping("/{id}/comentarios")
    fun getComentarios(@PathVariable id: Int): List<DiarioComentarioDto> {
        return service.listarComentarios(id)
    }

    // ✅ NUEVO: Publicar comentario en un diario
    @PostMapping("/{id}/comentarios")
    fun agregarComentario(
        @PathVariable id: Int,
        @RequestBody body: ComentarioCreateDto
    ): DiarioComentarioDto {
        return service.comentar(id, body.texto)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        authentication: Authentication,
        @Valid @RequestBody dto: DiarioCreateDto
    ): DiarioDto {
        val principal = authentication.principal as UserPrincipal
        return service.create(principal.uid, dto)
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Int,
        authentication: Authentication,
        @Valid @RequestBody dto: DiarioCreateDto
    ): DiarioDto {
        return service.update(id, dto)
    }

    @GetMapping("/publicos")
    fun publicos(pageable: Pageable): Page<DiarioDto> = service.publicos(pageable)

    @GetMapping("/mis-diarios")
    fun misDiarios(pageable: Pageable, authentication: Authentication): Page<DiarioDto> {
        val principal = authentication.principal as UserPrincipal
        return service.deUsuario(principal.uid, pageable)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Int, authentication: Authentication) {
        service.delete(id)
    }
}