package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime
import com.example.SpringBoot.TFG.model.TicketEstado

@Entity
@Table(name = "ticket")
data class Ticket(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(nullable = false, length = 100)
    val titulo: String,

    @Column(columnDefinition = "TEXT")
    val descripcion: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    val estado: TicketEstado = TicketEstado.ABIERTO,

    @Column(length = 20)
    var prioridad: String = "MEDIA",

    @Column(name = "fecha_creacion", updatable = false)
    val fechaCreacion: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    val usuario: Usuario
)