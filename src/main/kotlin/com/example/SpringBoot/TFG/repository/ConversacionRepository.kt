package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Conversacion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ConversacionRepository : JpaRepository<Conversacion, Int> {

    @Query("SELECT cp.conversacion FROM ConversacionParticipante cp WHERE cp.usuario.id = :userId")
    fun findByParticipanteId(userId: Int): List<Conversacion>

    // ✅ NUEVA CONSULTA: Busca un chat individual donde ambos usuarios sean participantes
    @Query("""
        SELECT cp1.conversacion 
        FROM ConversacionParticipante cp1 
        JOIN ConversacionParticipante cp2 ON cp1.conversacion.id = cp2.conversacion.id 
        WHERE cp1.usuario.id = :id1 
        AND cp2.usuario.id = :id2 
        AND cp1.conversacion.tipo = 'individual'
    """)
    fun findIndividualChatBetween(@Param("id1") id1: Int, @Param("id2") id2: Int): Conversacion?
}