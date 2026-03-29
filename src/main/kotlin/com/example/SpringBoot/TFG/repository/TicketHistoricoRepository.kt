package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.TicketHistorico
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TicketHistoricoRepository : JpaRepository<TicketHistorico, Int> {
    fun findAllByTicketIdOrderByFecha(ticketId: Int): List<TicketHistorico>
}