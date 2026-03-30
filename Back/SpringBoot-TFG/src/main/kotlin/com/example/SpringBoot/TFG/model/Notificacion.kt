package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notificacion")
data class Notificacion(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(nullable = false, columnDefinition = "TEXT")
    val mensaje: String,

    @Column(nullable = false, updatable = false)
    val fecha: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val leida: Boolean = false,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    val usuario: Usuario
)