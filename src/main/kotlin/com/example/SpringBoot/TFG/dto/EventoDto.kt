package com.example.SpringBoot.TFG.dto

import com.example.SpringBoot.TFG.model.EventoVisibilidad
import java.time.LocalDate
import java.time.LocalTime

data class EventoDto(
    val id: Int,
    val titulo: String,
    val descripcion: String?,
    val fechaEvento: LocalDate,
    val horaEvento: LocalTime,
    val visibilidad: EventoVisibilidad,
    // Devolvemos un objeto simple de usuario para que coincida con tu frontend
    val usuario: UsuarioResumenDto
)

data class UsuarioResumenDto(
    val id: Int,
    val nombre: String
)