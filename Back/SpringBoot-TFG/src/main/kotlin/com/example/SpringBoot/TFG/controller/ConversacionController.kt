package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.ConversacionCreateDto
import com.example.SpringBoot.TFG.service.ConversacionService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/conversaciones")
class ConversacionController(private val service: ConversacionService) {
    @GetMapping
    fun list() = service.listarMisConversaciones()

    @PostMapping
    fun create(@RequestBody dto: ConversacionCreateDto) = service.crearOObtenerConversacion(dto)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Int) = service.eliminarConversacion(id)
}