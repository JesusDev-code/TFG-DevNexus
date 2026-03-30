package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.ConversacionParticipante
import com.example.SpringBoot.TFG.model.ConversacionParticipanteId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConversacionParticipanteRepository : JpaRepository<ConversacionParticipante, ConversacionParticipanteId> {
    // JpaRepository ya incluye existsById, que usaremos para validar acceso
    // fun existsById(id: ConversacionParticipanteId): Boolean
}