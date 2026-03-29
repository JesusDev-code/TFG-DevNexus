package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "diario_colaboraciones")
data class DiarioColaboracion(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tema_id", nullable = false)
    val tema: DiarioTema,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val usuario: Usuario, // El usuario invitado

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var estado: InvitacionEstado = InvitacionEstado.PENDIENTE, // PENDIENTE, ACEPTADA

    @Column(name = "fecha_invitacion")
    val fechaInvitacion: LocalDateTime = LocalDateTime.now()
)

enum class InvitacionEstado {
    PENDIENTE, ACEPTADA, RECHAZADA
}