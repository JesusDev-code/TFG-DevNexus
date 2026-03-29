package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Ticket
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TicketRepository : JpaRepository<Ticket, Int> {

    // Busca todos los tickets pertenecientes a un usuario concreto
    // NOTA: Asegúrate de que en tu entidad Ticket el campo se llama 'usuario'.
    // Si se llama 'creadoPor', cambia esto a: findByCreadoPorId
    fun findByUsuarioId(usuarioId: Int): List<Ticket>
}