package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.EventoCreateDto
import com.example.SpringBoot.TFG.dto.EventoDto
import com.example.SpringBoot.TFG.service.EventoService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/eventos")
class EventoController(private val service: EventoService) {

    @GetMapping
    fun list(): List<EventoDto> = service.listarSeguro()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody dto: EventoCreateDto): EventoDto = service.crearEventoSeguro(dto)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Int) = service.eliminarEventoSeguro(id)
}