package com.example.SpringBoot.TFG.model

import jakarta.persistence.*

@Entity
@Table(name = "departamento")
data class Departamento(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(nullable = false, length = 100)
    val nombre: String
)