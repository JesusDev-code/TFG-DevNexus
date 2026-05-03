package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Diario
import com.example.SpringBoot.TFG.model.Visibilidad
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface DiarioRepository : JpaRepository<Diario, Int> {

    @EntityGraph(attributePaths = ["usuario", "tema", "revisadoPor"])
    fun findAllByVisibilidad(visibilidad: Visibilidad, pageable: Pageable): Page<Diario>

    // Mantenemos la antigua por compatibilidad
    @EntityGraph(attributePaths = ["usuario", "tema", "revisadoPor"])
    fun findAllByUsuarioId(usuarioId: Int, pageable: Pageable): Page<Diario>

    // ✅ NUEVA CONSULTA:
    // Trae notas donde:
    // 1. Soy el autor
    // 2. O soy el dueño del proyecto (Tema)
    // 3. O soy un colaborador ACEPTADO en el proyecto
    @Query("""
        SELECT DISTINCT d FROM Diario d 
        LEFT JOIN d.tema t 
        LEFT JOIN DiarioColaboracion c ON c.tema = t
        WHERE 
           d.usuario.id = :userId 
           OR 
           (t.usuario.id = :userId) 
           OR 
           (c.usuario.id = :userId AND c.estado = 'ACEPTADA')
    """)
    fun findAllPermitidos(@Param("userId") userId: Int, pageable: Pageable): Page<Diario>

    @EntityGraph(attributePaths = ["usuario", "tema", "revisadoPor"])
    fun findAllByTemaIdOrderByFechaCreacionDesc(temaId: Int): List<Diario>

    @EntityGraph(attributePaths = ["usuario", "tema", "revisadoPor"])
    @Query("""
        SELECT DISTINCT d FROM Diario d
        LEFT JOIN d.tema t
        LEFT JOIN DiarioColaboracion c ON c.tema = t
        WHERE t.id = :temaId AND (
            d.usuario.id = :userId
            OR t.usuario.id = :userId
            OR (c.usuario.id = :userId AND c.estado = 'ACEPTADA')
        )
        ORDER BY d.fechaCreacion DESC
    """)
    fun findPermitidosByTemaId(
        @Param("userId") userId: Int,
        @Param("temaId") temaId: Int
    ): List<Diario>
}
