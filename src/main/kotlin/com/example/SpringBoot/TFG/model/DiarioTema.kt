package com.example.SpringBoot.TFG.model

import jakarta.persistence.*
import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@Entity
@Table(
    name = "diario_tema",
    indexes = [Index(name = "idx_tema_usuario", columnList = "usuario_id")]
)
@JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
data class DiarioTema(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(length = 100)
    val titulo: String? = null,

    @Column(length = 255)
    val descripcion: String? = null,

    @OneToMany(mappedBy = "tema", cascade = [CascadeType.ALL], orphanRemoval = true)
    val colaboradores: MutableList<DiarioColaboracion> = mutableListOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    val usuario: Usuario


)