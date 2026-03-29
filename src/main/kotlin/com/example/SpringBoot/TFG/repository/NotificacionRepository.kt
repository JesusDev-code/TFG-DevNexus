package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Notificacion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificacionRepository : JpaRepository<Notificacion, Int> {
    // Método para obtener solo las notificaciones de un usuario específico
    fun findByUsuarioId(usuarioId: Int): List<Notificacion>
}