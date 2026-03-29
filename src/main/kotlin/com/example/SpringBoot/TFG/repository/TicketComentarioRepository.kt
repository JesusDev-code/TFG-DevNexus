package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.TicketComentario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TicketComentarioRepository : JpaRepository<TicketComentario, Int> {
    // Recupera el chat ordenado por fecha para que se lea en orden
    fun findAllByTicketIdOrderByFechaEnvioAsc(ticketId: Int): List<TicketComentario>
}