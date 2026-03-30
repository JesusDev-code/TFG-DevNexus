package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.DiarioTema
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DiarioTemaRepository : JpaRepository<DiarioTema, Int> {
    fun findByUsuarioId(usuarioId: Int): List<DiarioTema>
}