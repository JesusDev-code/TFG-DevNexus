package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.TicketCreateDto
import com.example.SpringBoot.TFG.dto.TicketUpdateDto // ✅ Importar el nuevo DTO
import com.example.SpringBoot.TFG.service.TicketService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tickets")
class TicketController(private val ticketService: TicketService) {

    @GetMapping
    fun listAll() = ticketService.listarTodos()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody dto: TicketCreateDto) = ticketService.crearTicket(dto)

    // ✅ NUEVO ENDPOINT PARA ACTUALIZACIÓN GENERAL (Admin Panel)
    @PatchMapping("/{id}")
    fun update(@PathVariable id: Int, @RequestBody dto: TicketUpdateDto) =
        ticketService.actualizarTicket(id, dto)

    // Este lo mantenemos por si la app de usuario lo usa específicamente
    @PutMapping("/{id}/estado")
    fun cambiarEstado(@PathVariable id: Int, @RequestBody body: Map<String, String>) =
        ticketService.cambiarEstado(id, body["nuevoEstado"] ?: "", body["comentario"])

    @GetMapping("/mis-tickets")
    fun listMisTickets() = ticketService.listarMisTickets()
}