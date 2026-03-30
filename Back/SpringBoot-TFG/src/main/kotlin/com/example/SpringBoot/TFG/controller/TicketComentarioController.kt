package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.TicketComentarioCreateDto
import com.example.SpringBoot.TFG.service.TicketService
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/tickets/{ticketId}/comentarios")
class TicketComentarioController(private val ticketService: TicketService) {

    @GetMapping
    fun listar(@PathVariable ticketId: Int) = ticketService.listarComentarios(ticketId)

    @PostMapping
    fun enviar(@PathVariable ticketId: Int, @RequestBody dto: TicketComentarioCreateDto) =
        ticketService.enviarComentario(ticketId, dto)
}