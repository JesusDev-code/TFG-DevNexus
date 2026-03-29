package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.model.Auditoria
import com.example.SpringBoot.TFG.service.AuditoriaService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/auditorias")
@PreAuthorize("hasRole('ADMIN')") // ✅ Seguridad correcta
class AuditoriaController(
    private val auditoriaService: AuditoriaService
) {

    // ✅ CAMBIO CLAVE: Devolvemos Page, no List
    @GetMapping
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) q: String?
    ): Page<Auditoria> {
        // Ordenamos por fecha descendente
        val pageable = PageRequest.of(page, size, Sort.by("fecha").descending())
        return auditoriaService.listarPaginado(q, pageable)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): Auditoria {
        return auditoriaService.obtenerPorId(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Log no encontrado")
    }
}