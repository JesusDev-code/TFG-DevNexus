package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Auditoria
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface AuditoriaRepository : JpaRepository<Auditoria, Int> {

    // Búsqueda inteligente: Busca texto en Acción, Recurso, Email o Descripción
    @Query("""
        SELECT a FROM Auditoria a 
        WHERE (:busqueda IS NULL OR :busqueda = '' OR 
              LOWER(a.accion) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR
              LOWER(a.recurso) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR
              LOWER(a.usuarioEmail) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR
              LOWER(a.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')))
    """)
    fun buscarPaginado(busqueda: String?, pageable: Pageable): Page<Auditoria>
}