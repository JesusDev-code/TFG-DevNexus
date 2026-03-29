package com.example.SpringBoot.TFG.dto

import com.example.SpringBoot.TFG.model.EventoVisibilidad
import java.time.LocalDate
import java.time.LocalTime

data class EventoCreateDto(
    val titulo: String,
    val descripcion: String?,
    val fechaEvento: LocalDate,
    val horaEvento: LocalTime,
    val visibilidad: EventoVisibilidad
)