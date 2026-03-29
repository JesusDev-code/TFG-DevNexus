package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "ticket_historico")
data class TicketHistorico(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    val ticket: Ticket,

    @Column(name = "estado_anterior", length = 30)
    val estadoAnterior: String? = null,

    @Column(name = "estado_nuevo", nullable = false, length = 30)
    val estadoNuevo: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val usuario: Usuario,

    @Column(columnDefinition = "TEXT")
    val comentario: String? = null,

    @Column(nullable = false, updatable = false)
    val fecha: LocalDateTime = LocalDateTime.now()
)