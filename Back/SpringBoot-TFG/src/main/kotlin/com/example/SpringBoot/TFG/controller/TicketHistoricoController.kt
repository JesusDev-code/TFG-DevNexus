package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.TicketHistoricoDto
import com.example.SpringBoot.TFG.service.TicketService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/ticket-historico")
class TicketHistoricoController(private val ticketService: TicketService) {

    @GetMapping("/ticket/{ticketId}")
    fun deTicket(@PathVariable ticketId: Int): List<TicketHistoricoDto> {
        return ticketService.listarHistorico(ticketId)
    }
}