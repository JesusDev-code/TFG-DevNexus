package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "auditoria")
data class Auditoria(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(nullable = false, length = 100)
    val accion: String, // "LOGIN", "CREAR", "ELIMINAR"

    @Column(nullable = false, length = 100)
    val recurso: String, // "Ticket", "Usuario", "Evento"

    @Column(columnDefinition = "TEXT")
    val descripcion: String? = null,

    @Column(length = 20)
    val severidad: String = "INFO", // ✅ NUEVO: "INFO", "WARNING", "DANGER"

    @Column(nullable = false, updatable = false)
    val fecha: LocalDateTime = LocalDateTime.now(),

    @Column(name = "usuario_id")
    val usuarioId: Int? = null,

    @Column(name = "usuario_email")
    val usuarioEmail: String? = null
)