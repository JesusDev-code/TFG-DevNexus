package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "conversacion",
    indexes = [Index(name = "idx_conv_creado", columnList = "creado_por")]
)
class Conversacion(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(length = 150)
    var titulo: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val tipo: ConversacionTipo = ConversacionTipo.individual,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por", nullable = false)
    val creadoPor: Usuario,

    @OneToMany(mappedBy = "conversacion", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val participantes: MutableSet<ConversacionParticipante> = mutableSetOf(),

    @Column(name = "fecha_creacion", updatable = false)
    val fechaCreacion: LocalDateTime = LocalDateTime.now()
)

enum class ConversacionTipo {
    individual, grupal
}