package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.DiarioTemaComentario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DiarioTemaComentarioRepository : JpaRepository<DiarioTemaComentario, Int> {
    fun findByTemaIdOrderByFechaAsc(temaId: Int): List<DiarioTemaComentario>
    fun findByTemaIdAndComunidadOrderByFechaAsc(temaId: Int, comunidad: Boolean): List<DiarioTemaComentario>
}
