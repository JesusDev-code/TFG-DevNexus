package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

enum class Plataforma { WEB, ANDROID, IOS }

@Entity
@Table(
    name = "usuario_fcm_token",
    indexes = [Index(name = "idx_fcm_token_usuario", columnList = "usuario_id")]
)
data class UsuarioFcmToken(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    var usuario: Usuario,

    @Column(nullable = false, unique = true, length = 500)
    val token: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    val plataforma: Plataforma,

    @Column(name = "fecha_creacion", nullable = false)
    val fechaCreacion: LocalDateTime = LocalDateTime.now(),

    @Column(name = "fecha_uso")
    var fechaUso: LocalDateTime? = null
)
