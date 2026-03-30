package com.example.SpringBoot.TFG.model

import jakarta.persistence.*

@Entity
@Table(name = "rol")
data class Rol(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    // Aseguramos que el nombre no sea null y sea único en la BD
    @Column(nullable = false, unique = true, length = 50)
    val nombre: String
)