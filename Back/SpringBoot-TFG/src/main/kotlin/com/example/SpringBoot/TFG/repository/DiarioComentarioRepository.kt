package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.DiarioComentario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DiarioComentarioRepository : JpaRepository<DiarioComentario, Int> {
    fun findByDiarioIdOrderByFechaAsc(diarioId: Int): List<DiarioComentario>
}