package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "usuario",
    indexes = [
        Index(name = "idx_firebase_uid", columnList = "firebase_uid", unique = true),
        Index(name = "idx_email", columnList = "email", unique = true)
    ]
)
data class Usuario(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(name = "firebase_uid", nullable = false, unique = true, length = 128)
    val firebaseUid: String,

    @Column(nullable = false, unique = true, length = 100)
    val email: String,

    @Column(nullable = false, length = 100)
    var nombre: String,

    @Column(name = "biografia", length = 500)
    var biografia: String? = null,

    @Column(name = "foto_perfil", length = 500)
    var foto_perfil: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_id", nullable = false)
    var rol: Rol,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    var departamento: Departamento? = null,

    @Column(name = "fcm_token", length = 255)
    var fcmToken: String? = null,

    // ✅ NUEVOS CAMPOS DE PRIVACIDAD
    @Column(name = "permite_contacto", nullable = false)
    var permiteContacto: Boolean = true,

    @Column(name = "motivo_no_contacto", columnDefinition = "TEXT")
    var motivoNoContacto: String? = null,

    @Column(name = "fecha_creacion", updatable = false)
    val fechaCreacion: LocalDateTime = LocalDateTime.now()
)