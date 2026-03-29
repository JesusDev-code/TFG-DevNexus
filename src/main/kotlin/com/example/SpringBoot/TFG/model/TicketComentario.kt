package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "ticket_comentario")
data class TicketComentario(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    val ticket: Ticket,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val autor: Usuario,

    @Column(columnDefinition = "TEXT", nullable = false)
    val texto: String,

    @Column(name = "fecha_envio", updatable = false)
    val fechaEnvio: LocalDateTime = LocalDateTime.now()
)