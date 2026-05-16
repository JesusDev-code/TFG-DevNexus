package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.DiarioColaboracion
import com.example.SpringBoot.TFG.model.InvitacionEstado
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface DiarioColaboracionRepository : JpaRepository<DiarioColaboracion, Long> {

    // ✅ ESTE ES EL QUE TE FALTA EN DIARIOSERVICE
    fun existsByTemaIdAndUsuarioIdAndEstado(temaId: Int, usuarioId: Int, estado: InvitacionEstado): Boolean

    // Para evitar invitar dos veces a la misma persona
    fun existsByTemaIdAndUsuarioId(temaId: Int, usuarioId: Int): Boolean

    // Para listar invitaciones pendientes
    fun findByUsuarioIdAndEstado(usuarioId: Int, estado: InvitacionEstado): List<DiarioColaboracion>

    // Colaboradores activos de un tema
    fun findByTemaIdAndEstado(temaId: Int, estado: InvitacionEstado): List<DiarioColaboracion>

    // Obtener IDs de temas donde soy colaborador (para filtros futuros)
    @Query("SELECT c.tema.id FROM DiarioColaboracion c WHERE c.usuario.id = :usuarioId AND c.estado = 'ACEPTADA'")
    fun findTemaIdsByColaborador(usuarioId: Int): List<Int>
}