package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "mensaje",
    indexes = [
        Index(name = "idx_msg_conversacion", columnList = "conversacion_id"),
        Index(name = "idx_msg_autor", columnList = "autor_id"),
        Index(name = "idx_msg_fecha", columnList = "fecha_envio")
    ]
)
data class Mensaje(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversacion_id", nullable = false)
    val conversacion: Conversacion,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    val autor: Usuario,

    @Column(nullable = false, columnDefinition = "TEXT")
    val texto: String,

    @Column(name = "fecha_envio", updatable = false)
    val fechaEnvio: LocalDateTime = LocalDateTime.now(),

    @Column(name = "leido_en")
    var leidoEn: LocalDateTime? = null
)