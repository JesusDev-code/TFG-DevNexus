package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Evento
import com.example.SpringBoot.TFG.model.EventoVisibilidad
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface EventoRepository : JpaRepository<Evento, Int> {
    fun findByVisibilidad(visibilidad: EventoVisibilidad): List<Evento>

    @Query("SELECT e FROM Evento e WHERE e.visibilidad = com.example.SpringBoot.TFG.model.EventoVisibilidad.PUBLICO OR e.usuario.id = :userId")
    fun findPublicosOrByUsuarioId(@Param("userId") userId: Int): List<Evento>

    @Modifying
    @Query("DELETE FROM Evento e WHERE e.fechaEvento < :fecha")
    fun deleteByFechaEventoBefore(@Param("fecha") fecha: LocalDate): Int

    fun findByFechaEvento(fecha: LocalDate): List<Evento>
}