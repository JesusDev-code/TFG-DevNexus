package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalTime

@Entity
@Table(name = "evento")
data class Evento(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(nullable = false, length = 100)
    val titulo: String,

    @Column(columnDefinition = "TEXT")
    val descripcion: String? = null,

    @Column(name = "fecha_evento", nullable = false)
    val fechaEvento: LocalDate,

    @Column(name = "hora_evento", nullable = false) // ✅ Nuevo campo
    val horaEvento: LocalTime,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val visibilidad: EventoVisibilidad = EventoVisibilidad.PRIVADO,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    val usuario: Usuario
)

enum class EventoVisibilidad {
    PRIVADO, PUBLICO
}