package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import java.time.LocalDateTime
import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@Entity
@Table(
    name = "diario",
    indexes = [
        Index(name = "idx_diario_usuario", columnList = "usuario_id"),
        Index(name = "idx_diario_visibilidad", columnList = "visibilidad"),
        Index(name = "idx_diario_tema", columnList = "tema_id")
    ]
)
data class Diario(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(columnDefinition = "TEXT")
    var contenido: String? = null,

    @Column(name = "fecha_creacion", updatable = false)
    val fechaCreacion: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var visibilidad: Visibilidad = Visibilidad.PRIVADO,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisado_por")
    val revisadoPor: Usuario? = null,

    @Column(name = "revision_comentario", columnDefinition = "TEXT")
    val revisionComentario: String? = null,

    @Column(name = "revision_en")
    val revisionEn: LocalDateTime? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    val usuario: Usuario,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tema_id")
    var tema: DiarioTema? = null
)
@JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
enum class Visibilidad {
    PRIVADO, PENDIENTE, PUBLICO
}